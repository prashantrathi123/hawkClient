import React from 'react';
import { SvgIcon } from '@mui/material';

export const CollectionIcon = (props) => {

    return (
        <SvgIcon viewBox="0 0 24 24" {...props}>
            {/* Bucket base */}
            <path d="M5 10 L5 18 C5 19.1 5.9 20 7 20 H17 C18.1 20 19 19.1 19 18 V10 Z" fill="none" stroke="currentColor" strokeWidth="2" />

            {/* Bucket cover */}
            <path d="M4 8 H20 C20.55 8 21 8.45 21 9 C21 9.55 20.55 10 20 10 H4 C3.45 10 3 9.55 3 9 C3 8.45 3.45 8 4 8 Z" fill="none" stroke="currentColor" strokeWidth="2" />

            {/* Handle */}
            <path d="M8 8 C8 6 16 6 16 8" fill="none" stroke="currentColor" strokeWidth="2" />
        </SvgIcon>
    );
};