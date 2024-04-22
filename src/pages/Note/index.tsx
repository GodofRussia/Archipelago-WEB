import React, {useEffect} from 'react';
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import {useParams} from 'react-router-dom';
import {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    diffSourcePlugin,
    DiffSourceToggleWrapper,
    headingsPlugin,
    imagePlugin,
    InsertImage,
    listsPlugin,
    ListsToggle,
    markdownShortcutPlugin,
    MDXEditor,
    MDXEditorMethods,
    quotePlugin,
    tablePlugin,
    thematicBreakPlugin,
    toolbarPlugin,
    UndoRedo,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import {getZoomSum, produceZoomJoin} from '../../api/zoom';
import {getChatSum} from '../../api/chat';
import {Note as NoteType, NoteDoc, Role} from '../../types/notes';
import {getNote} from '../../api/notes';
import {useDocument, useRepo} from '@automerge/automerge-repo-react-hooks';
import * as A from '@automerge/automerge/next';

import {Editor} from '../../components/AutoMergeNote';

function Note() {
    const {id = ''} = useParams();

    const ref = React.useRef<MDXEditorMethods>(null);
    const summRef = React.useRef<MDXEditorMethods>(null);

    const [note, setNote] = React.useState<NoteType | undefined>(undefined);
    const [role, setRole] = React.useState<string | null>('обычный');
    //const [doc, changeDoc] = useDocument<NoteDoc>(note?.automergeUrl);
    const repo = useRepo();

    const [handle, setHandle] = React.useState<A.DocHandle<NoteDoc> | undefined>(undefined);

    React.useEffect(() => {
        if (note?.automergeUrl) {
            console.log(note?.automergeUrl);
            const _handle = repo.find<NoteDoc>(note?.automergeUrl);
            setHandle(_handle);
        }
    }, [note?.automergeUrl, repo, handle]);

    const [sum, setSum] = React.useState<string>('');
    const [infoModalIsOpen, setInfoModalIsOpen] = React.useState(false);
    const [formModalIsOpen, setFormModalIsOpen] = React.useState(false);
    // const [userId] = React.useState<string>(JSON.parse(sessionStorage.getItem('user') || '{}')?.id);
    const [userId] = React.useState<string>('a25addc2-ec6b-4960-9779-05a846dc94fd');
    const [zoomUrl, setZoomUrl] = React.useState<string>('');

    React.useEffect(() => {
        getNote({id}).then((noteData) => {
            setNote(noteData);
        });
    }, [id, setNote]);

    return <>{handle ? <Editor handle={handle} path={['/home']} /> : <h1>Loading</h1>}</>;

    /*return (
        <MDXEditor
            ref={ref}
            className="dark-theme dark-editor"
            placeholder="Введите текст сюда"
            markdown={typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || ''}
            onChange={(md) => handleChangeMd(md)}
            plugins={[
                imagePlugin({
                    imageUploadHandler: (image) => {
                        return Promise.resolve(image.name);
                    },
                }),
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                tablePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                diffSourcePlugin({viewMode: 'rich-text'}),
                toolbarPlugin({
                    toolbarContents: () => (
                        <DiffSourceToggleWrapper>
                            <UndoRedo />
                            <BoldItalicUnderlineToggles />
                            <BlockTypeSelect />
                            <ListsToggle />
                            <InsertImage />
                        </DiffSourceToggleWrapper>
                    ),
                }),
            ]}
        />
    );*/
}

export default Note;
