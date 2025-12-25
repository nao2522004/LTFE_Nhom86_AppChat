import React from 'react';
import styles from './UserProfile.module.css';

const UserProfile: React.FC = () => {
    return (
        <section className={styles.profileContainer}>
            <div className={styles.banner}>
                <button className={styles.uploadCoverBtn}>Upload Cover</button>
            </div>

            <div className={styles.profileHeader}>
                <div className={styles.avatarContainer}>
                    <img src="https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg"
                        alt="Rachel" className={styles.bigAvatar} />
                    <div className={styles.avatarActions}>
                        <a className={styles.linkAction}>Change</a>
                        <a className={[styles.linkAction, styles.delete].join(' ')}>Delete</a>
                    </div>
                </div>
                <div className={styles.profileNames}>
                    <h2>Rachel Derek</h2>
                    <p>UI/UX Designer@spotify &nbsp; | &nbsp; <i className="fas fa-map-marker-alt"></i> Sylhet,
                        Bangladesh</p>
                </div>
            </div>

            <div className={styles.detailList}>
                <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Personal Meeting ID</div>
                    <div className={styles.detailValue}>
                        231-342-3245
                        <span className={styles.subText}>https://callme/231-342-3245</span>
                    </div>
                    <a href="#" className={styles.editLink}>Edit</a>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Email</div>
                    <div className={styles.detailValue}>rachel@callme.io</div>
                    <a href="#" className={styles.editLink}>Edit</a>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Subscription Type</div>
                    <div className={styles.detailValue}>
                        Basic User
                        <a href="#" className={styles.tagUpgrade}>Upgrade</a>
                    </div>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Time Zone</div>
                    <div className={styles.detailValue}>(GMT+6:00) Astana, Dhaka</div>
                    <a href="#" className={styles.editLink}>Edit</a>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Language</div>
                    <div className={styles.detailValue}>English</div>
                    <a href="#" className={styles.editLink}>Edit</a>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Password</div>
                    <div className={styles.detailValue}>••••••••</div>
                    <a href="#" className={styles.editLink}>Edit</a>
                </div>

                <div className={styles.detailRow}>
                    <div className={styles.detailLabel}>Device</div>
                    <div className={styles.detailValue}>
                        <a href="#" className={styles.editLink} style={{ fontWeight: 400 }}>Sign Out From All Devices <i
                            className="far fa-question-circle"></i></a>
                    </div>
                    <a href="#" className={styles.editLink}>Edit</a>
                </div>
            </div>
        </section>
    );
};

export default UserProfile;