import React, {useState} from 'react';
// import * as d3 from 'd3';
import {GraphNode} from "../../types/graph-types";
import {AudioSummarizer} from "../../utils/speech-kit.module";

const MainPage = () => {
    // const d3Container = useRef(null);

    // const data: GraphNode = {
    //     id: '1',
    //     name: 'Root',
    //     children: [
    //         {
    //             id: '2',
    //             name: 'Branch 1',
    //             children: [
    //                 { id: '3', name: 'Leaf 1' },
    //                 { id: '4', name: 'Leaf 2' }
    //             ]
    //         },
    //         {
    //             id: '5',
    //             name: 'Branch 2',
    //             children: [
    //                 { id: '6', name: 'Leaf 3' }
    //             ]
    //         },
    //     ]
    // };

    // React.useEffect(() => {
    //     if (data && d3Container.current) {
    //         const width = 800;
    //         const height = 600;
    //
    //         const svg = d3.select(d3Container.current)
    //             .append('svg')
    //             .attr('width', width)
    //             .attr('height', height);
    //
    //         const treeLayout = d3.tree<GraphNode>()
    //             .size([width - 160, height - 160]);
    //
    //         const root = d3.hierarchy(data, d => d.children);
    //
    //         treeLayout(root);
    //
    //         svg.selectAll('.link')
    //             .data(root.links())
    //             .enter()
    //             .append('path')
    //             .attr('class', 'link')
    //         // .attr('d', d3.linkHorizontal()
    //         //     .x((d) => d.x)
    //         //     .y((d) => d.y)
    //         // );
    //
    //         svg.selectAll('.node')
    //             .data(root.descendants())
    //             .enter()
    //             .append('g')
    //             .attr('class', 'node')
    //             // .attr('transform', d => `translate(${d.x},${d.y})`);
    //
    //         svg.selectAll('.node')
    //             .append('circle')
    //             .attr('r', 5);
    //
    //         svg.selectAll('.node')
    //             .append('text')
    //             .attr('dx', 8)
    //             .attr('dy', 3)
    //         // .text(d => d.data.name);
    //     }
    // }, [data, d3Container.current]);  // Эффект будет перезапускаться только если данные или ссылка на DOM изменились

    // // Создаём функцию для генерации путей для связей
    // const linkGenerator = linkHorizontal()
    //     .x(d => d.y)   // Предполагаем, что 'y' используется для горизонтального положения
    //     .y(d => d.x);  // 'x' - для вертикального (если рисуем горизонтальное дерево)

    const audioConverter = new AudioSummarizer(
        'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize?topic=general',
        'AQVNwCGJU5ig_17yfiOwJrhKojbesdqV2UEx1ho2',
        'http://185.241.194.125:8080/get-summarize'
    )
    const summarizedText = audioConverter.getSummarized();

    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [chunk, setChunk] = React.useState<BlobPart | undefined>(undefined)


    const handleStartRecording = React.useCallback(async () => {
        try {
            // Запрашиваем аудиопотоки с системного звука и микрофона
            const displayMediaOptions = {
                video: true,
                audio: true
            };

            const audioStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            let haveMicro = true;
            let haveMedia = true;

            if (audioStream.getAudioTracks().length === 0 ) {
                haveMedia = false;
            }

            if (micStream.getAudioTracks().length === 0 ) {
                haveMicro = false;
            }


            // Объединяем аудиопотоки
            const audioContext = new AudioContext();
            const audioDestination = audioContext.createMediaStreamDestination();
            const displayAudioSource = (haveMedia) ? audioContext.createMediaStreamSource(audioStream) : undefined;
            const micAudioSource = (haveMicro) ? audioContext.createMediaStreamSource(micStream) : undefined;

            displayAudioSource?.connect(audioDestination);
            micAudioSource?.connect(audioDestination);

            // Создаем экземпляр MediaRecorder
            const recorder = new MediaRecorder(audioDestination.stream);

            recorder.ondataavailable = (event: BlobEvent) => {
                if (event.data.size > 0) {
                    setChunk(event.data);
                }
            };

            recorder.start(15000);
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    }, []);

    const handleStopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setMediaRecorder(null);
            setRecording(false);
        }
    };

    React.useEffect(() => {
        if (chunk) {
            const blob = new Blob(chunk ? [chunk] : [], {type: 'audio/ogg'});
            audioConverter.convertAudio(blob);
        }
    }, [chunk]);

    return (
        <div>
            <button onClick={handleStartRecording} disabled={recording}>
                Start Recording
            </button>
            <button onClick={handleStopRecording} disabled={!recording}>
                Stop Recording
            </button>
        </div>
    )
};

export default MainPage;