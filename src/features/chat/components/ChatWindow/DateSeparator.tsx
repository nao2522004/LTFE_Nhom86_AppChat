import React from 'react';
import styles from './DateSeparator.module.css';

interface DateSeparatorProps {
    date: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
    return (
        <div className={styles.dateSeparator}>
            <div className={styles.line}></div>
            <span className={styles.dateText}>{date}</span>
            <div className={styles.line}></div>
        </div>
    );
};

export default DateSeparator;