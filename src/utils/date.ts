export function formatDateToMinute(dateStr: string): string {
    const date = new Date(dateStr);

    const padTo2Digits = (num: number) => num.toString().padStart(2, '0');

    return (
        [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1), // Плюс 1 потому что месяцы начинаются с 0
            padTo2Digits(date.getDate()),
        ].join('-') +
        'T' +
        [padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes())].join(':')
    );
}
