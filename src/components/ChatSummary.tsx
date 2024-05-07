import React from 'react';
import {
    headingsPlugin,
    listsPlugin,
    markdownShortcutPlugin,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
} from '@mdxeditor/editor';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    CircularProgress,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {notesApi} from '../services/NotesService';
import {chatAPI} from '../services/ChatService';
import {addExpandedSumId, removeExpandedSumId} from '../store/reducers/SummarizationSlice';

interface ChatSummaryProps {
    onGetSum: () => void;
    noteId: string;
    isLoadingSum: boolean;
}

const ChatSummary = ({onGetSum, noteId, isLoadingSum}: ChatSummaryProps) => {
    const {chatSum, chatInfo, expandedSumIds} = useAppSelector((state) => state.sumReducer);
    const {user} = useAppSelector((state) => state.userReducer);
    const dispatch = useAppDispatch();
    const ref = React.useRef<MDXEditorMethods>(null);

    const {data: isNoteOwner} = notesApi.useCheckNoteOwnerQuery(
        {
            userId: user?.id || '',
            noteId,
        },
        {skip: !user},
    );

    const [detachChat, {isError: isErrorDetaching, isLoading: isDetaching}] = chatAPI.useDetachNoteFromChatMutation();

    const handleDetachChat = () => {
        detachChat({id: noteId});
    };

    React.useEffect(() => {
        if (chatSum) ref.current?.setMarkdown(chatSum);
    }, [chatSum]);

    const onExpandedStateChanged = (_: React.SyntheticEvent, expanded: boolean) => {
        if (expanded && chatInfo) {
            dispatch(addExpandedSumId(chatInfo.chatId));
        } else if (chatInfo) {
            dispatch(removeExpandedSumId(chatInfo.chatId));
        }
    };

    return (
        <Accordion
            defaultExpanded={!!chatInfo && expandedSumIds.includes(chatInfo.chatId)}
            onChange={onExpandedStateChanged}
            sx={{py: '4px'}}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
                Суммаризация чата {chatInfo?.chatName || ''}
            </AccordionSummary>

            <AccordionDetails>
                {chatSum ? (
                    <MDXEditor
                        ref={ref}
                        className="dark-theme dark-editor"
                        placeholder="Суммаризация чата"
                        readOnly
                        plugins={[
                            listsPlugin(),
                            headingsPlugin(),
                            quotePlugin(),
                            tablePlugin(),
                            thematicBreakPlugin(),
                            markdownShortcutPlugin(),
                        ]}
                        markdown={chatSum}
                    />
                ) : (
                    <Typography>Ещё пока нет суммаризации</Typography>
                )}
            </AccordionDetails>

            <AccordionActions>
                {isLoadingSum ? (
                    <CircularProgress />
                ) : (
                    <Tooltip title={'Обновить суммаризацию'}>
                        <IconButton onClick={onGetSum} disabled={!isNoteOwner}>
                            <RefreshIcon fontSize={'medium'} />
                        </IconButton>
                    </Tooltip>
                )}
                {isDetaching ? (
                    <CircularProgress />
                ) : (
                    <Tooltip title={'Открепить заметку от чата'}>
                        <IconButton
                            color={isErrorDetaching ? 'error' : 'default'}
                            onClick={handleDetachChat}
                            disabled={!isNoteOwner}
                        >
                            <DeleteOutlineIcon fontSize={'medium'} color={'error'} />
                        </IconButton>
                    </Tooltip>
                )}
            </AccordionActions>
        </Accordion>
    );
};

export default ChatSummary;
