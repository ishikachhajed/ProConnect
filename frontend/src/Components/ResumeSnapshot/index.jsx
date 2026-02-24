import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { BASE_URL } from "@/config";
import styles from "./resume_snapshot.module.css";

export default function ResumeSnapshot({ user, isOwnProfile }) {
    const router = useRouter();
    const [currentCard, setCurrentCard] = useState(0);
    const [template, setTemplate] = useState('modern'); // 'modern' | 'classic'
    const pdfRef = useRef(null);

    const totalCards = isOwnProfile ? 4 : 3;

    // Helper function to ensure URL has protocol
    const ensureHttps = (url) => {
        if (!url) return url;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    const handleNext = () => {
        setCurrentCard((prev) => (prev + 1) % totalCards);
    };

    const handlePrev = () => {
        setCurrentCard((prev) => (prev - 1 + totalCards) % totalCards);
    };

    const handleDownloadPDF = async () => {
        if (typeof window === "undefined") return;
        const html2pdf = (await import("html2pdf.js")).default;

        const element = pdfRef.current;
        const opt = {
            margin: [10, 10, 10, 10], // top, left, bottom, right
            filename: `${user?.userId?.username || 'profile'}_resume.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    const handleEditProfile = () => {
        router.push("/profile_edit");
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Resume Snapshot</h3>
                <button className={styles.downloadBtn} onClick={handleDownloadPDF}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Download PDF
                </button>
            </div>

            {/* Template Selector */}
            <div className={styles.templateSelector}>
                <h4 className={styles.selectorTitle}>Choose Resume Template</h4>
                <div className={styles.templateCards}>
                    {/* Modern Template Card */}
                    <div
                        className={`${styles.templateCard} ${template === 'modern' ? styles.templateCardActive : ''}`}
                        onClick={() => setTemplate('modern')}
                    >
                        <div className={styles.templatePreview} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)' }}>
                            <div className={styles.previewLayout}>
                                <div className={styles.previewSidebar} style={{ background: 'rgba(255,255,255,0.2)' }}></div>
                                <div className={styles.previewMain}></div>
                            </div>
                        </div>
                        <div className={styles.templateInfo}>
                            <h5>Modern</h5>
                            <p>Professional blue theme with sidebar</p>
                        </div>
                    </div>

                    {/* Classic Template Card */}
                    <div
                        className={`${styles.templateCard} ${template === 'classic' ? styles.templateCardActive : ''}`}
                        onClick={() => setTemplate('classic')}
                    >
                        <div className={styles.templatePreview} style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                            <div className={styles.previewLayout}>
                                <div className={styles.previewMain} style={{ width: '100%' }}></div>
                            </div>
                        </div>
                        <div className={styles.templateInfo}>
                            <h5>Classic</h5>
                            <p>Traditional black & white layout</p>
                        </div>
                    </div>

                    {/* Minimal Template Card */}
                    <div
                        className={`${styles.templateCard} ${template === 'minimal' ? styles.templateCardActive : ''}`}
                        onClick={() => setTemplate('minimal')}
                    >
                        <div className={styles.templatePreview} style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                            <div className={styles.previewLayout}>
                                <div className={styles.previewGrid}>
                                    <div style={{ background: 'rgba(255,255,255,0.2)', height: '20px' }}></div>
                                    <div style={{ background: 'rgba(255,255,255,0.2)', height: '20px' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.templateInfo}>
                            <h5>Minimal</h5>
                            <p>Compact green theme, space-efficient</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.cardContainer}>
                {/* CARD 1: BASIC INFO */}
                <div className={`${styles.card} ${currentCard === 0 ? styles.activeCard : currentCard > 0 ? styles.prevCard : ''}`}>
                    <img
                        src={user?.userId?.profilePicture ? `${BASE_URL}${user.userId.profilePicture}` : "/default-avatar.png"}
                        alt="avatar"
                        className={styles.avatar}
                    />
                    <h2 className={styles.name}>{user?.userId?.name}</h2>
                    <p className={styles.username}>@{user?.userId?.username}</p>

                    {user?.currentPost && <p className={styles.role}>{user.currentPost}</p>}

                    {user?.education && user.education.length > 0 && (
                        <p className={styles.education}>
                            Studied {user.education[0].fieldOfStudy} at {user.education[0].school}
                        </p>
                    )}

                    {user?.careerStatus && <span className={styles.status}>{user.careerStatus}</span>}
                </div>

                {/* CARD 2: SKILLS */}
                <div className={`${styles.card} ${currentCard === 1 ? styles.activeCard : currentCard > 1 ? styles.prevCard : ''}`}>
                    <h4>🛠 My Skills</h4>
                    <div className={styles.skillsGrid}>
                        {user?.skills && user.skills.length > 0 ? (
                            user.skills.map((skill, index) => (
                                <span key={index} className={styles.skillBadge}>
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p className={styles.textMuted}>No skills added yet.</p>
                        )}
                    </div>
                </div>

                {/* CARD 3: FEATURED PROJECT */}
                <div className={`${styles.card} ${currentCard === 2 ? styles.activeCard : currentCard > 2 ? styles.prevCard : ''}`}>
                    <h4>🚀 Featured Project</h4>
                    {user?.featuredProject?.title ? (
                        <>
                            <h3 className={styles.projectTitle}>{user.featuredProject.title}</h3>
                            <p className={styles.projectDesc}>
                                {user.featuredProject.description || "No description provided."}
                            </p>
                            <div className={styles.projectLinks}>
                                {user.featuredProject.githubLink && (
                                    <a href={user.featuredProject.githubLink} target="_blank" rel="noreferrer" className={styles.link}>
                                        GitHub
                                    </a>
                                )}
                                {user.featuredProject.leetcodeLink && (
                                    <a href={user.featuredProject.leetcodeLink} target="_blank" rel="noreferrer" className={styles.link}>
                                        LeetCode
                                    </a>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className={styles.textMuted}>No featured project added yet.</p>
                    )}
                </div>

                {/* CARD 4: ADD MORE (OWNER ONLY) */}
                {isOwnProfile && (
                    <div className={`${styles.card} ${styles.addCard} ${currentCard === 3 ? styles.activeCard : ''}`} onClick={handleEditProfile}>
                        <div className={styles.addIcon}>+</div>
                        <h3>Add More Info</h3>
                        <p>Update your profile with more details, skills, or projects.</p>
                    </div>
                )}
            </div>

            {/* CONTROLS */}
            <div className={styles.controls}>
                <button className={styles.navBtn} onClick={handlePrev}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <div className={styles.dots}>
                    {Array.from({ length: totalCards }).map((_, i) => (
                        <div key={i} className={`${styles.dot} ${currentCard === i ? styles.activeDot : ''}`} />
                    ))}
                </div>
                <button className={styles.navBtn} onClick={handleNext}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            {/* PDF HIDDEN LAYOUT */}
            <div className={styles.pdfWrapper}>
                <div ref={pdfRef} className={`${styles.pdfContainer} ${styles[template]}`}>
                    {/* HEADER */}
                    <div className={styles.pdfHeader}>
                        <div className={styles.pdfHeaderLeft}>
                            <h1 className={styles.pdfName}>{user?.userId?.name}</h1>
                            <p className={styles.pdfRole}>{user?.currentPost}</p>
                            <p className={styles.pdfContact}>
                                {user?.userId?.email} • @{user?.userId?.username}
                            </p>
                        </div>
                        {user?.userId?.profilePicture && (
                            <img
                                src={`${BASE_URL}${user.userId.profilePicture}`}
                                alt="Profile"
                                className={styles.pdfProfilePic}
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                    </div>


                    <div className={styles.pdfBody}>
                        {/* LEFT COLUMN (Modern) or FULL WIDTH (Classic) */}
                        <div className={styles.pdfMain}>

                            {/* ABOUT */}
                            {user?.bio && (
                                <div className={styles.pdfSection}>
                                    <h4 className={styles.pdfHeading}>About Me</h4>
                                    <p className={styles.pdfText}>{user.bio}</p>
                                </div>
                            )}

                            {/* EXPERIENCE */}
                            {user?.pastWork && user.pastWork.length > 0 && (
                                <div className={styles.pdfSection}>
                                    <h4 className={styles.pdfHeading}>Experience</h4>
                                    {user.pastWork.map((work, i) => (
                                        <div key={i} className={styles.pdfItem}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <strong>{work.company}</strong>
                                                <span>{work.years}</span>
                                            </div>
                                            <p>{work.position}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PROJECTS (MULTIPLE) */}
                            {user?.projects && user.projects.length > 0 && (
                                <div className={styles.pdfSection}>
                                    <h4 className={styles.pdfHeading}>Projects</h4>
                                    {user.projects.slice(0, 5).map((proj, i) => (
                                        <div key={i} className={styles.pdfItem}>
                                            <strong style={{ fontSize: '14px' }}>{proj.title}</strong>
                                            {proj.githubLink && <a href={proj.githubLink} className={styles.pdfLink}> • GitHub</a>}
                                            {proj.liveLink && <a href={ensureHttps(proj.liveLink)} className={styles.pdfLink}> • Live</a>}
                                            <p className={styles.pdfText}>{proj.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* FEATURED PROJECT (Legacy fallback) */}
                            {user?.featuredProject?.title && (!user?.projects || user.projects.length === 0) && (
                                <div className={styles.pdfSection}>
                                    <h4 className={styles.pdfHeading}>Featured Project</h4>
                                    <strong>{user.featuredProject.title}</strong>
                                    <p className={styles.pdfText}>{user.featuredProject.description}</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (Modern) or BOTTOM (Classic) */}
                        <div className={styles.pdfSidebar}>
                            {/* SKILLS */}
                            {user?.skills && user.skills.length > 0 && (
                                <div className={styles.pdfSection}>
                                    <h4 className={styles.pdfHeading}>Skills</h4>
                                    <div className={styles.pdfSkills}>
                                        {user.skills.map(s => (
                                            <span key={s} className={styles.pdfSkillBadge}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* EDUCATION */}
                            {user?.education && user.education.length > 0 && (
                                <div className={styles.pdfSection}>
                                    <h4 className={styles.pdfHeading}>Education</h4>
                                    {user.education.map((edu, i) => (
                                        <div key={i} className={styles.pdfItem}>
                                            <strong>{edu.school}</strong>
                                            <p>{edu.degree} - {edu.fieldOfStudy}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* CAREER GOALS */}
                            {user?.weeklyGoals && user.weeklyGoals.length > 0 && (
                                <div className={styles.pdfSection}>
                                    <h4 className={styles.pdfHeading}>Career Goals</h4>
                                    <ul style={{ paddingLeft: '15px', margin: 0 }}>
                                        {user.weeklyGoals.map(g => <li key={g} style={{ fontSize: '12px' }}>{g}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
