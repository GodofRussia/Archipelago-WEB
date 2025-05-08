import React from 'react';

export function useAvoidMissingFetchingData<T>({isLoading, data}: {isLoading: boolean; data: T}): T | null {
    const [dataWithoutMissingValues, setDataWithoutMissingValues] = React.useState<T | null>(null);

    React.useEffect(() => {
        setDataWithoutMissingValues((prevData) => (!isLoading ? data || null : prevData));
    }, [data, isLoading]);

    return dataWithoutMissingValues;
}
