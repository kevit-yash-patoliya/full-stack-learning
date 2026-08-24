import { createContext, createElement, useState, useContext } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

type User = { name: string; score: number };
type UserContextValue = {
    user: User;
    setUser: Dispatch<SetStateAction<User>>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState({ name: 'Alex', score: 100 });

    return createElement(
        UserContext.Provider,
        { value: { user, setUser } },
        children,
    );
}

// Component A: Cares ONLY about user.name
function UserName() {
    const context = useContext(UserContext);
    if (!context) throw new Error('UserName must be used within UserProvider');
    const { user } = context;
    console.log('UserName rendered!'); // ⚠️ Re-renders when score changes!
    return createElement('h1', null, user.name);
}

// Component B: Updates user.score
function ScoreButton() {
    const context = useContext(UserContext);
    if (!context) throw new Error('ScoreButton must be used within UserProvider');
    const { setUser } = context;
    return createElement(
        'button',
        { onClick: () => setUser(u => ({ ...u, score: u.score + 1 })) },
        'Increase Score',
    );
}