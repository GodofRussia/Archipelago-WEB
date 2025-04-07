import React from 'react';

import {CKEditor} from '@ckeditor/ckeditor5-react';
import {Range as ModelRange} from '@ckeditor/ckeditor5-engine';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import {Paragraph} from 'ckeditor5/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';

import {NoteDoc} from '../types/notes';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as A from '@automerge/automerge/next';
import {useDocument} from '@automerge/automerge-repo-react-hooks';
import {AnyDocumentId} from '@automerge/automerge-repo';
import './Editor.css';

const Editor = ({automergeUrl}: {automergeUrl: AnyDocumentId}) => {
    const [doc, changeDoc] = useDocument<NoteDoc>(automergeUrl);
    const editorRef = React.useRef<ClassicEditor | null>(null);

    const handleChangeMd = (value: string) => {
        if (doc) {
            changeDoc((doc: NoteDoc) => {
                A.updateText(doc, ['text'], value);
            });
        }
    };

    const [firstRange, setFirstRange] = React.useState<ModelRange | null>(null);

    const [curDoc, setCurDoc] = React.useState<string | null>(null);
    const [isDataInProgress, setIsDataInProgress] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (doc && editorRef.current && curDoc != doc.text) {
            setIsDataInProgress(true);
            if (firstRange) {
                const data = typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '';
                editorRef.current?.setData(data);
                editorRef.current.model.enqueueChange((w) => {
                    try {
                        const root = w.model.document.getRoot();
                        if (root) {
                            const newRange = w.createRange(w.createPositionAt(root, 'end'));
                            w.setSelection(newRange);
                            setFirstRange(newRange);
                        }
                    } catch (e) {
                        const root = w.model.document.getRoot();

                        if (root) {
                            const newRange = w.createRange(w.createPositionAt(root, 'end'));
                            w.setSelection(newRange);
                            setFirstRange(newRange);
                        }
                    }
                });

                setCurDoc(data);
            } else {
                const data = typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '';
                setCurDoc(data);
                editorRef.current?.setData(data);
                setFirstRange(null);
            }

            setIsDataInProgress(false);
        }
    }, [curDoc, doc, doc?.text, firstRange]);

    return (
        <CKEditor
            onReady={(editor) => {
                editorRef.current = editor;
            }}
            onChange={(_, editor) => {
                const data = editor.getData();

                if (data != curDoc && !isDataInProgress) {
                    editor.model.enqueueChange((w) => {
                        const selection = w.model.document.selection;
                        const fRange = selection.getFirstRange();

                        setFirstRange(fRange);
                        setCurDoc(data);
                        handleChangeMd(data);
                    });
                }
            }}
            editor={ClassicEditor}
            config={{
                plugins: [
                    Alignment,
                    Autoformat,
                    BlockQuote,
                    Bold,
                    PictureEditing,
                    Essentials,
                    FontFamily,
                    FontSize,
                    Heading,
                    Highlight,
                    Italic,
                    Link,
                    List,
                    Paragraph,
                    PasteFromOffice,
                    RemoveFormat,
                    Strikethrough,
                    Underline,
                    Markdown,
                ],
                toolbar: [
                    'heading',
                    '|',
                    'fontsize',
                    'fontfamily',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'strikethrough',
                    'removeFormat',
                    'highlight',
                    '|',
                    'alignment',
                    '|',
                    'numberedList',
                    'bulletedList',
                    '|',
                    'undo',
                    'redo',
                    '|',
                    'comment',
                    'commentsArchive',
                    'trackChanges',
                    '|',
                    'ckbox',
                    'imageUpload',
                    'link',
                    'blockquote',
                    'insertTable',
                    'mediaEmbed',
                ],
            }}
            data={typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || ''}
        />
    );
};

export default Editor;
