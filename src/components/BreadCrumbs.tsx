import React from 'react';
import {Breadcrumbs, Divider, Skeleton, Typography} from '@mui/material';
import {dirsApi} from '../services/DirsService';
import {useAppSelector} from '../hooks/useRedux';

const BreadCrumbs = () => {
    const {user} = useAppSelector((selector) => selector.userReducer);
    const {activeNote} = useAppSelector((selector) => selector.notesReducer);
    const {data: noteDir} = dirsApi.useGetDirQuery(
        {
            userId: user?.id || '',
            dirId: activeNote?.dirId || 0,
        },
        {skip: !user || !activeNote},
    );

    const breadcrumbs = React.useMemo(
        () => [
            noteDir ? (
                <Typography key="1" variant={'subtitle1'} color="text.primary">
                    {noteDir.name}
                </Typography>
            ) : (
                <Skeleton width={'100px'} />
            ),
            activeNote ? (
                <Typography key="2" variant={'subtitle1'} color="text.primary">
                    {activeNote.title}
                </Typography>
            ) : (
                <Skeleton width={'100px'} />
            ),
        ],
        [activeNote, noteDir],
    );

    return (
        <>
            <Breadcrumbs aria-label="breadcrumb" sx={{display: 'flex', justifyContent: 'center'}}>
                {breadcrumbs}
            </Breadcrumbs>
            <Divider sx={{marginLeft: '-24px', width: 'calc(100% + 48px)'}} />
        </>
    );
};

export default BreadCrumbs;
