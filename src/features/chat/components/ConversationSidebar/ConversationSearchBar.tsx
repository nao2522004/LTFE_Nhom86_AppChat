import React from "react";
import styles from "./ConversationSidebar.module.css";

interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
}

const ConversationSearchBar: React.FC<SearchBoxProps> = ({ value, onChange }) => {
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

export default ConversationSearchBar;