import React from 'react';
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import {useNavigate} from 'react-router-dom';
import {createNote, listNotes} from '../../api/notes';
import {Note} from '../../types/notes';
import NoteCard from '../../components/NoteCard';
import {useRepo} from '@automerge/automerge-repo-react-hooks';

function MainPage() {
    // const d3Container = React.useRef(null);
    const navigate = useNavigate();
    const repo = useRepo();

    const [title, setTitle] = React.useState<string>('');
    const [isCreateNoteDialogOpen, setCreateNoteDialogIsOpen] = React.useState(false);
    const [notes, setNotes] = React.useState<Note[]>([]);

    // const audioConverter = new AudioSummarizer(
    //     'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?topic=general',
    //     'AQVNwCGJU5ig_17yfiOwJrhKojbesdqV2UEx1ho2',
    //     'http://185.241.194.125:8080/api/get-summarize',
    // );
    // const data = {name: ''};

    // const [recording, setRecording] = useState(false);
    // const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    // eslint-disable-next-line no-undef
    // const [chunk, setChunk] = React.useState<BlobPart | undefined>(undefined);
    // const [summarize, setSummarize] = useState('');

    // React.useEffect(() => {
    //     if (data && d3Container.current) {
    //         const margin = {top: 10, right: 10, bottom: 10, left: 100};
    //         const width = 400;
    //         const height = 200;
    //
    //         // Очищаем контейнер перед добавлением новых элементов
    //         d3.select(d3Container.current).selectAll('*').remove();
    //
    //         const svg = d3
    //             .select(d3Container.current)
    //             .append('svg')
    //             .attr('width', width + margin.left + margin.right)
    //             .attr('height', height + margin.top + margin.bottom)
    //             .append('g')
    //             .attr('transform', `translate(${margin.left},${margin.top})`);
    //
    //         // Создаем иерархию данных и вычисляем расположение узлов
    //         const root = d3.hierarchy(data);
    //         const treeLayout = (d3.tree() as TreeLayout<GraphNode>).size([height, width]);
    //         const rootNode: HierarchyPointNode<GraphNode> = treeLayout(root);
    //
    //         const linkGenerator = d3
    //             .linkVertical<HierarchyPointLink<GraphNode>, HierarchyPointNode<GraphNode>>()
    //             .x((node) => node.x)
    //             .y((node) => node.y);
    //
    //         svg.selectAll('.link')
    //             .data(rootNode.links())
    //             .enter()
    //             .append('path')
    //             .attr('class', 'link')
    //             .attr('d', linkGenerator);
    //
    //         // Создаем каждый узел в виде группы с кругом и текстом
    //         const nodes = svg
    //             .selectAll('.node')
    //             .data(rootNode.descendants())
    //             .enter()
    //             .append('g')
    //             .attr('class', 'node')
    //             .attr('transform', (d) => `translate(${d.x},${d.y / 2})`);
    //
    //         nodes.append('circle').attr('r', 10);
    //
    //         nodes
    //             .append('text')
    //             .attr('dy', '.35em')
    //             .attr('x', -13)
    //             .style('text-anchor', 'end')
    //             .text((d) => d.data.name);
    //     }
    // }, [data, d3Container.current]); // Эффект будет перезапускаться только если данные или ссылка на DOM изменились

    // const handleStartRecording = React.useCallback(async () => {
    //     try {
    //         // Запрашиваем аудиопотоки с системного звука и микрофона
    //         const displayMediaOptions = {
    //             video: true,
    //             audio: true,
    //         };
    //
    //         const audioStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    //         const micStream = await navigator.mediaDevices.getUserMedia({
    //             audio: true,
    //         });
    //         let haveMicro = true;
    //         let haveMedia = true;
    //
    //         if (audioStream.getAudioTracks().length === 0) {
    //             haveMedia = false;
    //         }
    //
    //         if (micStream.getAudioTracks().length === 0) {
    //             haveMicro = false;
    //         }
    //
    //         // Объединяем аудиопотоки
    //         const audioContext = new AudioContext();
    //         const audioDestination = audioContext.createMediaStreamDestination();
    //         const displayAudioSource = haveMedia ? audioContext.createMediaStreamSource(audioStream) : undefined;
    //         const micAudioSource = haveMicro ? audioContext.createMediaStreamSource(micStream) : undefined;
    //
    //         displayAudioSource?.connect(audioDestination);
    //         micAudioSource?.connect(audioDestination);
    //
    //         // Создаем экземпляр MediaRecorder
    //         const recorder = new MediaRecorder(audioDestination.stream);
    //
    //         recorder.ondataavailable = (event) => {
    //             if (event.data.size > 0) {
    //                 setChunk(event.data);
    //             }
    //         };
    //
    //         recorder.start(10000);
    //         setMediaRecorder(recorder);
    //         setRecording(true);
    //     } catch (error) {
    //         console.error('Error starting recording:', error);
    //     }
    // }, []);
    //
    // const handleStopRecording = () => {
    //     if (mediaRecorder) {
    //         mediaRecorder.stop();
    //         setMediaRecorder(null);
    //         setRecording(false);
    //     }
    // };
    //
    // React.useEffect(() => {
    //     if (chunk) {
    //         const blob = new Blob(chunk ? [chunk] : [], {type: 'audio/ogg'});
    //         const formData = new FormData();
    //         formData.append('oggFile', blob, 'audio.ogg');
    //
    //         audioConverter.convertAudio(formData).then(() => {
    //             audioConverter.summarize().then((message) => setSummarize(message));
    //         });
    //     }
    // }, [chunk]);

    const handleCreateNote = React.useCallback(async () => {
        const note = await createNote({title}, repo);
        navigate(`/notes/${note.data.id}`);
    }, [navigate, title]);

    React.useEffect(() => {
        listNotes().then((notesData) => setNotes(notesData.data.notes));
    }, []);

    return (
        // <div
        //     style={{
        //         display: 'flex',
        //         flexDirection: 'column',
        //         gap: '32px',
        //         padding: '10px',
        //     }}
        // >
        //     <div style={{display: 'flex', flexDirection: 'row', gap: '32px'}}>
        //         <button
        //             style={{color: 'grey'}}
        //             className="glow-on-hover"
        //             type={'button'}
        //             onClick={handleStartRecording}
        //             disabled={recording}
        //         >
        //             Начать запись
        //         </button>
        //         <button className="glow-on-hover" type={'button'} onClick={handleStopRecording} disabled={!recording}>
        //             Остановить запись
        //         </button>
        //     </div>
        //     <h3 style={{paddingLeft: '30px'}}>Что было в звонке</h3>
        //     {summarize}
        //     {/*<svg style={{height: '1000px'}} ref={d3Container}></svg>*/}
        // </div>
        <Box sx={{p: 2}}>
            <Box
                display="flex"
                sx={{
                    width: '100%',
                    height: '100%',
                    p: 2,
                    pt: 5,
                    flexWrap: 'wrap',
                    gap: 3,
                }}
            >
                <Button
                    startIcon={<AddIcon />}
                    className="glow-on-hover"
                    color={'secondary'}
                    onClick={() => setCreateNoteDialogIsOpen(true)}
                    sx={{height: '80px'}}
                >
                    Создать заметку
                </Button>
                {notes.map((currentNote, idx) => (
                    <NoteCard
                        key={idx}
                        {...currentNote}
                        refetchNotes={() => {
                            listNotes().then((notesData) => setNotes(notesData.data.notes));
                        }}
                    />
                ))}
            </Box>

            <Dialog
                open={isCreateNoteDialogOpen}
                onClose={() => setCreateNoteDialogIsOpen(false)}
                aria-labelledby="create-note-dialog-title"
                aria-describedby="create-note-dialog-description"
            >
                <DialogTitle id="create-note-dialog-title">Создать заметку</DialogTitle>
                <DialogContent>
                    <TextField
                        type="text"
                        margin="dense"
                        id="zoom-url"
                        label="Заголовок заметки"
                        size="small"
                        variant="outlined"
                        fullWidth
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateNoteDialogIsOpen(false)}>Закрыть</Button>
                    <Button onClick={handleCreateNote}>Создать</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default MainPage;
