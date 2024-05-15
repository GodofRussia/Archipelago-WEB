import React, {useRef, useState} from 'react';
import * as CKBox from 'ckbox';

import {CKEditor} from '@ckeditor/ckeditor5-react';

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
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import {Paragraph} from 'ckeditor5/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Markdown from '@ckeditor/ckeditor5-markdown-gfm/src/markdown';

import Comments from '@ckeditor/ckeditor5-comments/src/comments';

//import 'ckbox/dist/styles/ckbox.css';
// import {PresenceList} from '@ckeditor/ckeditor5-real-time-collaboration';
import {NoteDoc} from '../types/notes';
import * as A from '@automerge/automerge/next';
import {useDocument} from '@automerge/automerge-repo-react-hooks';
import {AnyDocumentId} from '@automerge/automerge-repo';
//import {CloudServices} from '@ckeditor/ckeditor5-cloud-services';

import './Editor.css';

const Editor = ({automergeUrl}: {automergeUrl: AnyDocumentId}) => {
    const sidebarElementRef = React.useRef<HTMLDivElement>();
    const presenceListElementRef = React.useRef<HTMLDivElement>();

    console.log(automergeUrl);

    const [doc, changeDoc] = useDocument<NoteDoc>(automergeUrl);

    const handleChangeMd = (value: string) => {
        if (doc) {
            changeDoc((doc: NoteDoc) => {
                A.updateText(doc, ['text'], value);
            });
        }
    };

    const [firstRange, setFirstRange] = useState(null);

    const [curDoc, setCurDoc] = useState(null);
    const [dataInProgres, dataInProgresSet] = useState(false);
    const editorRef = useRef(null);

    React.useEffect(() => {
        if (doc && editorRef.current && curDoc != doc.text) {
            //console.log(editorRef.current);

            // console.log('setCurrentSelection: ', selection.getFirstRange());

            // console.log(typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '');
            dataInProgresSet(true);
            if (firstRange) {
                const data = typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '';
                editorRef.current?.setData(data);
                editorRef.current.model.enqueueChange((w) => {
                    const newRange = w.createRange(firstRange.start);
                    //console.log('new range:', newRange);

                    try {
                        w.setSelection(newRange);
                        //console.log('selection set');
                    } catch (e) {
                        console.log(e);
                    }
                    setFirstRange(newRange);
                });
                setCurDoc(data);
            } else {
                const data = typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '';
                setCurDoc(data);
                editorRef.current?.setData(data);
            }
            dataInProgresSet(false);
        }

        //ref.current?.setMarkdown(typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || '');
    }, [doc?.text]);

    return (
        // <div className="App">
        //     <main>
        //         <div className="centered">
        //             <div className="row-presence">
        //                 <div ref={presenceListElementRef} className="presence"></div>
        //             </div>
        //             {/* const cloudServicesConfig = this.props.configuration; */}
        //             <div className="row row-editor">
        <CKEditor
            onReady={(editor) => {
                editorRef.current = editor;
                //console.log(editorRef);
                // // Switch between inline and sidebar annotations according to the window size.
                // this.boundRefreshDisplayMode = this.refreshDisplayMode.bind(this, editor);
                // // Prevent closing the tab when any action is pending.
                // this.boundCheckPendingActions = this.checkPendingActions.bind(this, editor);
                // window.addEventListener('resize', this.boundRefreshDisplayMode);
                // window.addEventListener('beforeunload', this.boundCheckPendingActions);
                // this.refreshDisplayMode(editor);
            }}
            onChange={(event, editor) => {
                //console.log(event);
                const data = editor.getData();

                //console.log(dataInProgres);
                if (data != curDoc && !dataInProgres) {
                    editor.model.enqueueChange((w) => {
                        const selection = w.model.document.selection;
                        //console.log('selection:', selection);
                        //console.log('selection range count:', selection.rangeCount);
                        const fRange = selection.getFirstRange();
                        //console.log('firstRange:', fRange);
                        setFirstRange(fRange);

                        setCurDoc(data);
                        handleChangeMd(data);

                        // const data = editor.getData();
                    });
                }

                // const selection = editor.model.document.selection;
                // console.log('selection:', selection);
                // console.log('setCurrentSelection: ', selection.getFirstRange());
                // console.log('setCurrentSelection start: ', selection.getFirstRange().start);
                // setCurrentSelection(selection.getFirstRange());
                // const data = editor.getData();
                // console.log({event, editor, data});
            }}
            editor={ClassicEditor}
            config={{
                plugins: [
                    Alignment,
                    Autoformat,
                    BlockQuote,
                    Bold,
                    // CKBoxPlugin,
                    PictureEditing,
                    // CloudServices,
                    //Comments,
                    Essentials,
                    FontFamily,
                    FontSize,
                    Heading,
                    Highlight,
                    // Image,
                    // ImageCaption,
                    // ImageResize,
                    // ImageStyle,
                    // ImageToolbar,
                    // ImageUpload,
                    Italic,
                    Link,
                    List,
                    //MediaEmbed,
                    Paragraph,
                    PasteFromOffice,
                    // PresenceList,
                    // RealTimeCollaborativeComments,
                    // RealTimeCollaborativeTrackChanges,
                    RemoveFormat,
                    Strikethrough,
                    //Table,
                    //TableToolbar,
                    //TrackChanges,
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
                // image: {
                //     toolbar: [
                //         'imageStyle:inline',
                //         'imageStyle:block',
                //         'imageStyle:side',
                //         '|',
                //         'toggleImageCaption',
                //         'imageTextAlternative',
                //         '|',
                //         'comment',
                //     ],
                // },
                // table: {
                //     contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
                //     tableToolbar: ['comment'],
                // },
                // mediaEmbed: {
                //     toolbar: ['comment'],
                // },
                // sidebar: {
                //     //container: sidebarElementRef.current,
                // },
                // presenceList: {
                //     //container: presenceListElementRef.current,
                // },
                // comments: {
                //     editorConfig: {
                //         extraPlugins: [Bold, Italic, Underline, List, Autoformat],
                //     },
                // },
            }}
            // ckbox: {
            //     tokenUrl: cloudServicesConfig.ckboxTokenUrl || cloudServicesConfig.tokenUrl,
            // },
            data={typeof doc?.text === 'string' ? doc?.text || '' : doc?.text.join('') || ''}
        />
        //                 <div ref={sidebarElementRef} className="sidebar"></div>
        //             </div>
        //         </div>
        //     </main>
        // </div>
    );
};

export default Editor;
