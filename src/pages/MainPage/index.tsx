import {Box, Typography} from '@mui/material';

function MainPage() {
    // const d3Container = React.useRef(null);
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

    return (
        <Box
            display="flex"
            flexGrow={1}
            sx={{
                width: '100%',
                height: '100%',
                p: 2,
                pt: 5,
            }}
            alignItems={'center'}
            justifyContent={'center'}
        >
            <Typography variant="h5" component="h1" textAlign="center">
                Выберите заметку для начала работы
            </Typography>
        </Box>
    );
}

export default MainPage;
