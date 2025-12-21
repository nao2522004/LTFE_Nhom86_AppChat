import React from 'react';
import styles from './UserProfile.module.css';
import { User } from '../../../shared/types/user';

interface UserProfileProps {
    user: User;
    isEditable?: boolean;
    onEdit?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isEditable = false, onEdit }) => {
    return (
        <section className="profile-container">
            <div className="banner">
                <button className="btn-upload-cover">Upload Cover</button>
            </div>

            <div className="profile-header">
                <div className="avatar-container">
                    <img src="https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg"
                        alt="Rachel" className="big-avatar" />
                    <div className="avatar-actions">
                        <a className="link-action">Change</a>
                        <a className="link-action delete">Delete</a>
                    </div>
                </div>
                <div className="profile-names">
                    <h2>Rachel Derek</h2>
                    <p>UI/UX Designer@spotify &nbsp; | &nbsp; <i className="fas fa-map-marker-alt"></i> Sylhet,
                        Bangladesh</p>
                </div>
            </div>

            <div className="detail-list">
                <div className="detail-row">
                    <div className="detail-label">Personal Meeting ID</div>
                    <div className="detail-value">
                        231-342-3245
                        <span className="sub-text">https://callme/231-342-3245</span>
                    </div>
                    <a href="#" className="edit-link">Edit</a>
                </div>

                <div className="detail-row">
                    <div className="detail-label">Email</div>
                    <div className="detail-value">rachel@callme.io</div>
                    <a href="#" className="edit-link">Edit</a>
                </div>

                <div className="detail-row">
                    <div className="detail-label">Subscription Type</div>
                    <div className="detail-value">
                        Basic User
                        <a href="#" className="tag-upgrade">Upgrade</a>
                    </div>
                </div>

                <div className="detail-row">
                    <div className="detail-label">Time Zone</div>
                    <div className="detail-value">(GMT+6:00) Astana, Dhaka</div>
                    <a href="#" className="edit-link">Edit</a>
                </div>

                <div className="detail-row">
                    <div className="detail-label">Language</div>
                    <div className="detail-value">English</div>
                    <a href="#" className="edit-link">Edit</a>
                </div>

                <div className="detail-row">
                    <div className="detail-label">Password</div>
                    <div className="detail-value">••••••••</div>
                    <a href="#" className="edit-link">Edit</a>
                </div>

                <div className="detail-row">
                    <div className="detail-label">Device</div>
                    <div className="detail-value">
                        <a href="#" className="edit-link" style={{ fontWeight: 400 }}>Sign Out From All Devices <i
                            className="far fa-question-circle"></i></a>
                    </div>
                    <a href="#" className="edit-link">Edit</a>
                </div>
            </div>
        </section>
    );
};

export default UserProfile;