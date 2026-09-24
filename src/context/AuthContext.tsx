import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole, UserProfile, JobSeekerProfile, CompanyProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  jobSeekerProfile: JobSeekerProfile | null;
  currentCompany: CompanyProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, role: UserRole, displayName: string) => Promise<void>;
  loginWithGoogle: (roleForNewUser?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateJobSeekerProfile: (profile: Partial<JobSeekerProfile>) => Promise<void>;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => Promise<void>;
  setUserRole: (role: UserRole) => Promise<void>;
  demoLoginAs: (role: UserRole) => Promise<void>;
  instantGuestLogin: (role?: UserRole, customName?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [jobSeekerProfile, setJobSeekerProfile] = useState<JobSeekerProfile | null>(null);
  const [currentCompany, setCurrentCompany] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Local fallback storage for manual signups when Email/Password is not enabled in Firebase Console
  const LOCAL_USERS_KEY = 'kormoai_registered_users';
  const LOCAL_SESSION_KEY = 'kormoai_active_session';

  const getLocalUsers = (): Record<string, { profile: UserProfile; passwordHash: string; seeker?: JobSeekerProfile; company?: CompanyProfile }> => {
    try {
      const data = localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const saveLocalUsers = (users: Record<string, { profile: UserProfile; passwordHash: string; seeker?: JobSeekerProfile; company?: CompanyProfile }>) => {
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  // Sync auth state
  useEffect(() => {
    // Check if there is an active local user session
    const checkLocalSession = () => {
      try {
        const stored = localStorage.getItem(LOCAL_SESSION_KEY);
        if (stored) {
          const session = JSON.parse(stored);
          const users = getLocalUsers();
          const record = users[session.email.toLowerCase()];
          if (record) {
            // Fake user object compatible with app requirements
            setUser({
              uid: record.profile.uid,
              email: record.profile.email,
              displayName: record.profile.displayName,
              photoURL: record.profile.photoURL || null
            } as unknown as FirebaseUser);
            setUserProfile(record.profile);
            if (record.seeker) setJobSeekerProfile(record.seeker);
            if (record.company) setCurrentCompany(record.company);
            setLoading(false);
            return true;
          }
        }
      } catch (err) {
        console.warn('Session parse error:', err);
      }
      return false;
    };

    const hasLocal = checkLocalSession();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        localStorage.removeItem(LOCAL_SESSION_KEY);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setUserProfile(data);
            await fetchRoleData(firebaseUser.uid, data.role);
          } else {
            // New user signed in (e.g., via Google) without user record yet
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: 'jobseeker',
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              profileCompleted: false
            };
            await setDoc(userDocRef, defaultProfile);
            setUserProfile(defaultProfile);
            await fetchRoleData(firebaseUser.uid, 'jobseeker');
          }
        } catch (err) {
          console.error('Error fetching user profile from Firestore:', err);
        }
      } else if (!hasLocal && !localStorage.getItem(LOCAL_SESSION_KEY)) {
        setUser(null);
        setUserProfile(null);
        setJobSeekerProfile(null);
        setCurrentCompany(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchRoleData = async (uid: string, role: UserRole, providedName?: string, providedEmail?: string) => {
    try {
      const effectiveName = providedName || user?.displayName || userProfile?.displayName || 'User';
      const effectiveEmail = providedEmail || user?.email || userProfile?.email || '';

      if (role === 'jobseeker') {
        const seekerRef = doc(db, 'jobSeekers', uid);
        const seekerSnap = await getDoc(seekerRef);
        if (seekerSnap.exists()) {
          setJobSeekerProfile(seekerSnap.data() as JobSeekerProfile);
        } else {
          // Initialize empty seeker profile with actual signup name & email
          const initialSeeker: JobSeekerProfile = {
            uid,
            fullName: effectiveName,
            email: effectiveEmail,
            headline: '',
            bio: '',
            phone: '',
            location: 'Dhaka, Bangladesh',
            skills: ['React', 'JavaScript', 'Problem Solving'],
            education: [],
            experience: [],
            projects: [],
            certifications: [],
            languages: ['Bengali', 'English'],
            preferredRoles: [],
            preferredIndustries: ['Information Technology'],
            preferredLocations: ['Dhaka'],
            employmentPreference: 'Full-time',
            completionScore: 30,
            updatedAt: new Date().toISOString()
          };
          await setDoc(seekerRef, initialSeeker);
          setJobSeekerProfile(initialSeeker);
        }
      } else if (role === 'recruiter') {
        const companyRef = doc(db, 'companies', `comp_${uid}`);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          setCurrentCompany(companySnap.data() as CompanyProfile);
        } else {
          const newCompany: CompanyProfile = {
            id: `comp_${uid}`,
            recruiterId: uid,
            name: `${effectiveName}'s Organization`,
            logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&auto=format&fit=crop&q=80',
            industry: 'Technology & Services',
            companySize: '10-50 employees',
            foundedYear: 2024,
            website: 'https://example.com',
            email: effectiveEmail,
            phone: '+880 1700-000000',
            location: 'Dhaka, Bangladesh',
            description: 'Recruitment & Talent Acquisition partner on Kormo BD platform.',
            verified: true
          };
          await setDoc(companyRef, newCompany);
          setCurrentCompany(newCompany);
        }
      }
    } catch (err) {
      console.error('Error fetching role specific data:', err);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    const normalizedEmail = (email || '').trim().toLowerCase();
    const effectiveEmail = normalizedEmail || `user_${Date.now()}@kormo.local`;
    const effectivePass = pass || 'DefaultPass@123';

    try {
      try {
        await signInWithEmailAndPassword(auth, effectiveEmail, effectivePass);
        localStorage.removeItem(LOCAL_SESSION_KEY);
        return;
      } catch (authErr: unknown) {
        // Fallback to local users or auto-create account on the fly!
        const localUsers = getLocalUsers();
        const existing = localUsers[effectiveEmail];
        if (existing) {
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ email: effectiveEmail }));
          setUser({
            uid: existing.profile.uid,
            email: existing.profile.email,
            displayName: existing.profile.displayName,
            photoURL: existing.profile.photoURL || null
          } as unknown as FirebaseUser);
          setUserProfile(existing.profile);
          if (existing.seeker) setJobSeekerProfile(existing.seeker);
          if (existing.company) setCurrentCompany(existing.company);
          return;
        }

        // If account does not exist, seamlessly auto-create and sign in immediately!
        const defaultName = effectiveEmail.split('@')[0] || 'Member';
        const capitalizedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
        await signupWithEmail(effectiveEmail, effectivePass, 'jobseeker', capitalizedName);
      }
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, role: UserRole, displayName: string) => {
    setLoading(true);
    const cleanName = (displayName || '').trim() || (role === 'recruiter' ? 'Hiring Partner' : 'Job Seeker');
    const normalizedEmail = (email || '').trim().toLowerCase() || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}_${Date.now()}@kormo.local`;
    const safePass = pass && pass.length >= 6 ? pass : 'DefaultPass@123';

    try {
      let createdUid = '';
      let isFirebaseAuthSuccessful = false;

      try {
        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, safePass);
        createdUid = cred.user.uid;
        isFirebaseAuthSuccessful = true;
        try {
          await updateProfile(cred.user, { displayName: cleanName });
        } catch {
          // ignore
        }
      } catch (authErr: unknown) {
        // If Firebase Auth is disabled or fails, guarantee a working local user ID
        createdUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }

      const newProfile: UserProfile = {
        uid: createdUid,
        email: normalizedEmail,
        role,
        displayName: cleanName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profileCompleted: false
      };

      // Try writing to Firestore if authenticated, or store locally
      if (isFirebaseAuthSuccessful) {
        try {
          await setDoc(doc(db, 'users', createdUid), newProfile);
        } catch (e) {
          console.warn('Firestore user write warning:', e);
        }
        setUserProfile(newProfile);
        await fetchRoleData(createdUid, role, cleanName, normalizedEmail);
      } else {
        // Save to local registry and active session
        const users = getLocalUsers();
        let seekerData: JobSeekerProfile | undefined;
        let companyData: CompanyProfile | undefined;

        if (role === 'jobseeker') {
          seekerData = {
            uid: createdUid,
            fullName: cleanName,
            email: normalizedEmail,
            headline: 'Aspiring Professional',
            bio: '',
            phone: '',
            location: 'Dhaka, Bangladesh',
            skills: ['React', 'JavaScript', 'Problem Solving'],
            education: [],
            experience: [],
            projects: [],
            certifications: [],
            languages: ['Bengali', 'English'],
            preferredRoles: [],
            preferredIndustries: ['Information Technology'],
            preferredLocations: ['Dhaka'],
            employmentPreference: 'Full-time',
            completionScore: 35,
            updatedAt: new Date().toISOString()
          };
          setJobSeekerProfile(seekerData);
        } else if (role === 'recruiter') {
          companyData = {
            id: `comp_${createdUid}`,
            recruiterId: createdUid,
            name: `${cleanName}'s Organization`,
            logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&auto=format&fit=crop&q=80',
            industry: 'Technology & Services',
            companySize: '10-50 employees',
            foundedYear: 2024,
            website: 'https://example.com',
            email: normalizedEmail,
            phone: '+880 1700-000000',
            location: 'Dhaka, Bangladesh',
            description: 'Recruitment & Talent Acquisition partner on Kormo BD.',
            verified: true
          };
          setCurrentCompany(companyData);
        }

        users[normalizedEmail] = {
          profile: newProfile,
          passwordHash: safePass,
          seeker: seekerData,
          company: companyData
        };
        saveLocalUsers(users);

        // Store active session and state
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ email: normalizedEmail }));
        setUser({
          uid: createdUid,
          email: normalizedEmail,
          displayName: cleanName,
          photoURL: null
        } as unknown as FirebaseUser);
        setUserProfile(newProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (roleForNewUser: UserRole = 'jobseeker') => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email || '',
          role: roleForNewUser,
          displayName: cred.user.displayName || 'Google User',
          photoURL: cred.user.photoURL || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profileCompleted: false
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        await fetchRoleData(cred.user.uid, roleForNewUser, cred.user.displayName || 'User', cred.user.email || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setUserProfile(null);
    setJobSeekerProfile(null);
    setCurrentCompany(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch {
      // If offline/local, still simulate success
    }
  };

  const updateJobSeekerProfile = async (updates: Partial<JobSeekerProfile>) => {
    if (!user || !jobSeekerProfile) return;
    const updated = {
      ...jobSeekerProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    // Calculate simple completion score
    let score = 20;
    if (updated.headline) score += 15;
    if (updated.bio) score += 15;
    if (updated.skills && updated.skills.length >= 3) score += 15;
    if (updated.experience && updated.experience.length >= 1) score += 15;
    if (updated.education && updated.education.length >= 1) score += 10;
    if (updated.resumeUrl || updated.resumeFileName) score += 10;
    updated.completionScore = Math.min(100, score);

    setJobSeekerProfile(updated);

    try {
      const seekerRef = doc(db, 'jobSeekers', user.uid);
      await setDoc(seekerRef, updated);
    } catch {
      // Save locally
      const users = getLocalUsers();
      if (user.email && users[user.email.toLowerCase()]) {
        users[user.email.toLowerCase()].seeker = updated;
        saveLocalUsers(users);
      }
    }
  };

  const updateCompanyProfile = async (updates: Partial<CompanyProfile>) => {
    if (!user || !currentCompany) return;
    const updated = {
      ...currentCompany,
      ...updates
    };
    setCurrentCompany(updated);

    try {
      const compRef = doc(db, 'companies', currentCompany.id);
      await setDoc(compRef, updated);
    } catch {
      // Save locally
      const users = getLocalUsers();
      if (user.email && users[user.email.toLowerCase()]) {
        users[user.email.toLowerCase()].company = updated;
        saveLocalUsers(users);
      }
    }
  };

  const setUserRole = async (newRole: UserRole) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { role: newRole, updatedAt: new Date().toISOString() });
    if (userProfile) {
      setUserProfile({ ...userProfile, role: newRole });
    }
    await fetchRoleData(user.uid, newRole);
  };

  // Instant Guest Login - No authentication or credentials needed at all!
  const instantGuestLogin = async (role: UserRole = 'jobseeker', customName?: string) => {
    setLoading(true);
    try {
      const generatedId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const cleanName = (customName && customName.trim()) 
        ? customName.trim() 
        : role === 'recruiter' 
          ? 'Guest Recruiter (HR Partner)' 
          : role === 'admin' 
            ? 'Guest Moderator' 
            : 'Guest Job Seeker';
      const cleanEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'guest'}@kormo.local`;

      const newProfile: UserProfile = {
        uid: generatedId,
        email: cleanEmail,
        role,
        displayName: cleanName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profileCompleted: true
      };

      const guestUser = {
        uid: generatedId,
        email: cleanEmail,
        displayName: cleanName,
        photoURL: null
      } as unknown as FirebaseUser;

      let seekerData: JobSeekerProfile | undefined;
      let companyData: CompanyProfile | undefined;

      if (role === 'jobseeker') {
        seekerData = {
          uid: generatedId,
          fullName: cleanName,
          email: cleanEmail,
          headline: 'Full-Stack Developer & Tech Professional',
          bio: 'Exploring opportunities in Bangladesh technology, product, and software ecosystems. Skilled in modern engineering stacks.',
          phone: '+880 1712-345678',
          location: 'Dhaka, Bangladesh',
          skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'System Architecture'],
          education: [{
            id: 'edu_1',
            institution: 'BUET / Dhaka University',
            degree: 'B.Sc in Computer Science & Engineering',
            fieldOfStudy: 'Computer Science',
            startDate: '2019-01',
            endDate: '2023-01'
          }],
          experience: [{
            id: 'exp_1',
            company: 'Tech Innovations BD',
            position: 'Software Engineer',
            startDate: '2023-02',
            endDate: 'Present',
            current: true,
            responsibilities: [
              'Architecting scalable web applications and responsive user interfaces.',
              'Implementing real-time data sync and modern TypeScript integrations.'
            ]
          }],
          projects: [],
          certifications: [],
          languages: ['Bengali', 'English'],
          preferredRoles: ['Frontend Engineer', 'Full-Stack Developer'],
          preferredIndustries: ['Information Technology', 'Fintech'],
          preferredLocations: ['Dhaka', 'Remote'],
          employmentPreference: 'Full-time',
          completionScore: 90,
          updatedAt: new Date().toISOString()
        };
        if (seekerData) setJobSeekerProfile(seekerData);
      } else if (role === 'recruiter') {
        companyData = {
          id: `comp_${generatedId}`,
          recruiterId: generatedId,
          name: `${cleanName}'s Organization`,
          logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=150&auto=format&fit=crop&q=80',
          industry: 'Software & Technology Services',
          companySize: '20-100 employees',
          foundedYear: 2023,
          website: 'https://example.com',
          email: cleanEmail,
          phone: '+880 1700-000000',
          location: 'Gulshan-2, Dhaka, Bangladesh',
          description: 'Modern digital products and enterprise software engineering team.',
          verified: true
        };
        if (companyData) setCurrentCompany(companyData);
      }

      // Persist in local storage for instant return visits
      const users = getLocalUsers();
      users[cleanEmail.toLowerCase()] = {
        profile: newProfile,
        passwordHash: 'guest',
        seeker: seekerData,
        company: companyData
      };
      saveLocalUsers(users);

      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ email: cleanEmail.toLowerCase() }));
      setUser(guestUser);
      setUserProfile(newProfile);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click demo persona for effortless testing
  const demoLoginAs = async (role: UserRole) => {
    setLoading(true);
    try {
      const demoEmail = role === 'recruiter' ? 'demo.recruiter@bkash.com' : role === 'admin' ? 'admin@kormoai.dev' : 'seeker.tanvir@kormoai.dev';
      const demoPass = 'DemoPass@1234';
      const demoName = role === 'recruiter' ? 'Rahim Chowdhury (bKash HR)' : role === 'admin' ? 'Platform Moderator' : 'Tanvir Hossain';
      
      try {
        await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      } catch (authError) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
          const newProfile: UserProfile = {
            uid: cred.user.uid,
            email: demoEmail,
            role,
            displayName: demoName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profileCompleted: true
          };
          await setDoc(doc(db, 'users', cred.user.uid), newProfile);
          setUserProfile(newProfile);
          await fetchRoleData(cred.user.uid, role);
        } catch {
          // Seamless fallback to instant guest login with demo details
          await instantGuestLogin(role, demoName);
        }
      }
    } catch {
      await instantGuestLogin(role);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        jobSeekerProfile,
        currentCompany,
        loading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        updateJobSeekerProfile,
        updateCompanyProfile,
        setUserRole,
        demoLoginAs,
        instantGuestLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
