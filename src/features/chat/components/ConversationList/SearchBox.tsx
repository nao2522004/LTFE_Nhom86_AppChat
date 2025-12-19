import React from "react";
import styles from "./ConversationList.module.css";

interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange }) => {
    return (
        <div className={styles.searchBox}>
            <i className="fas fa-search"></i>
            <input
                type="text"
                placeholder="Search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default SearchBox;