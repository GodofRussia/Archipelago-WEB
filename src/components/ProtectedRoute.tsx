import {Navigate} from 'react-router-dom';
import {useAppSelector} from '../hooks/useRedux';
import React from 'react';

export function ProtectedRoute({
    children,
    isMainPage,
}: React.PropsWithChildren & {isMainPage?: boolean}): React.ReactElement {
    const {user} = useAppSelector((state) => state.userReducer);
    if (!user) {
        return <Navigate to={isMainPage ? '/welcome' : '/login'} />;
    }

    return <>{children}</>;
}
