import React from "react";
import ConversationItem from "./ConversationItem";
import SearchBox from "./SearchBox";
import styles from "./ConversationList.module.css";

const ConversationList: React.FC = () => {
    return (
        <div className={styles.listPanel}>
            <SearchBox />

            {/* Group Section */}
            <div>
                <div className={styles.sectionTitle}>Groups</div>
                <div className={styles.chatListCard}>
                    <ConversationItem
                        avatar="https://i.pravatar.cc/150?img=11"
                        name="Friends Forever"
                        lastMessage="Hahahahaha!!"
                        time="Today, 9:52pm"
                        unreadCount={4}
                    />
                    <ConversationItem 
                        avatar="https://i.pravatar.cc/150?img=8" 
                        name="Mera Gang" 
                        lastMessage="Kyuuuuui???" 
                        time="Yesterday, 12:31pm" 
                    />
                </div>
            </div>

            {/* People Section */}
            <div>
                <div className={styles.sectionTitle}>People</div>
                <div className={styles.chatListCard}>
                    <ConversationItem 
                        avatar="https://i.pravatar.cc/150?img=3" 
                        name="Anil" 
                        lastMessage="April fool's day" 
                        time="Today, 9:52pm" 
                        isActive={true}
                        isOnline={true}
                    />
                    <ConversationItem 
                        avatar="https://i.pravatar.cc/150?img=3" 
                        name="Anil" 
                        lastMessage="April fool's day" 
                        time="Today, 9:52pm" 
                        isActive={true}
                        isOnline={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default ConversationList;