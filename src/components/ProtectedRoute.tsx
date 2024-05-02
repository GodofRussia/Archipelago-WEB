import {Navigate} from 'react-router-dom';
import {useAppSelector} from '../hooks/useRedux';
import React from 'react';

export function ProtectedRoute({children}: React.PropsWithChildren): React.ReactElement {
    const {user} = useAppSelector((state) => state.userReducer);
    console.log(user);
    if (!user) {
        return <Navigate to="/login" />;
    }

    return <>{children}</>;
}
