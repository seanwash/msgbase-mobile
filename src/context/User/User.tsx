import React, { createContext, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import { auth } from '../../lib/fire';

const defaultValues: {
  authInitialized: boolean;
  authenticated: boolean;
  user: firebase.User | undefined;
  signOut: () => void;
} = {
  authInitialized: true,
  authenticated: false,
  user: undefined,
  signOut: async () => await auth.signOut(),
};

export const UserContext = createContext(defaultValues);

const UserProvider: React.FC = ({ children }) => {
  const [authInitialized, setAuthInitialized] = useState<boolean>(
    defaultValues.authInitialized,
  );
  const [authenticated, setAuthenticated] = useState(
    defaultValues.authenticated,
  );
  const [user, setUser] = useState<firebase.User>();

  // Listen to the Firebase Auth state changes so that the context state is updated accordingly.
  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged(
      (observedUser: firebase.User | null) => {
        // TODO: What's the convention here? I've read that using undefined everywhere is easier than null
        setUser(observedUser || undefined);
        setAuthenticated(!!observedUser);
        // setAuthInitialized should be called last to avoid so that anything
        // depending on a User having been loaded reads the correct, non default
        // value.
        setAuthInitialized(false);
      },
    );

    // Make sure we un-register Firebase observers when the component unmounts.
    return () => unregisterAuthObserver();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        authInitialized,
        authenticated,
        signOut: defaultValues.signOut,
      }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
