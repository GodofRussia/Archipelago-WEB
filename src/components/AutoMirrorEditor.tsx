import {DocHandle, DocHandleChangePayload} from '@automerge/automerge-repo';
import React, {useEffect, useState, useRef} from 'react';
import {Command, EditorState, Transaction} from 'prosemirror-state';
import {MarkType, Schema} from 'prosemirror-model';
import {EditorView} from 'prosemirror-view';
// import 'prosemirror-view/style/prosemirror.css';
// import 'prosemirror-example-setup';
import {Prop} from '@automerge/automerge';

import {AutoMirror} from '@automerge/prosemirror';
import {NoteDoc} from '../types/notes';

import {exampleSetup} from 'prosemirror-example-setup';

import './Editor.css';

export function useHandleReady(handle: DocHandle<NoteDoc>) {
    const [isReady, setIsReady] = useState(handle.isReady());
    useEffect(() => {
        if (!isReady) {
            handle.whenReady().then(() => {
                setIsReady(true);
            });
        }
    }, [handle]);
    return isReady;
}

export type EditorProps = {
    handle: DocHandle<NoteDoc>;
    path: Prop[];
};

export function Editor({handle, path}: EditorProps) {
    console.log('url:', handle.url);
    const editorRoot = useRef<HTMLDivElement>(null);
    // const [view, setView] = useState<EditorView | null>(null);
    const handleReady = useHandleReady(handle);
    console.log(handleReady);
    // const [imageModalOpen, setImageModalOpen] = useState(false);
    // const [linkModalOpen, setLinkModalOpen] = useState(false);

    useEffect(() => {
        if (!handleReady) {
            return;
        }
        const autoMirror = new AutoMirror(path);

        const initialDoc = autoMirror.initialize(handle, path);
        const editorConfig = {
            schema: autoMirror.schema,
            history,
            // plugins: exampleSetup({schema: autoMirror.schema}),
            /*[
                ,
                keymap({
                    'Mod-b': toggleBold(autoMirror.schema),
                    'Mod-i': toggleItalic(autoMirror.schema),
                    'Mod-l': toggleMark(autoMirror.schema.marks.link, {
                        href: 'https://example.com',
                        title: 'example',
                    }),
                    Enter: splitListItem(autoMirror.schema.nodes.list_item),
                }),
                keymap(baseKeymap),
            ],*/
            doc: initialDoc,
        };

        const state = EditorState.create(editorConfig);
        const view = new EditorView(editorRoot.current, {
            state,
            dispatchTransaction: (tx: Transaction) => {
                //console.log(`${name}: dispatchTransaction`, tx)
                const newState = autoMirror.intercept(handle, tx, view.state);
                view.updateState(newState);
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onPatch: (args: DocHandleChangePayload<unknown>) => void = ({doc, patches, patchInfo}) => {
            console.log(`${name}: patch received`);
            const newState = autoMirror.reconcilePatch(patchInfo.before, doc, patches, view.state);
            view.updateState(newState);
        };
        handle.on('change', onPatch);

        // setView(view);

        return () => {
            handle.off('change', onPatch);
            view.destroy();
        };
    }, [handleReady]);

    if (!handleReady) {
        return <div>Loading...</div>;
    }

    return <div id="editor" ref={editorRoot} />;
}
