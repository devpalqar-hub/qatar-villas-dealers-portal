"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    FiHome,
    FiUser,
    FiMail,
    FiShield,
    FiArrowRight,
    FiX,
    FiCheckCircle,
    FiAlertCircle,
    FiFileText,
    FiArrowLeft,
    FiSend,
    FiUploadCloud,
} from "react-icons/fi";
import { useDealerOnboarding } from "@/hooks/useDealerOnboarding";
import { BasicInfoData, BusinessDetailsData } from "@/services/dealerOnboarding.service";
// uploadFileToS3 not used here – files sent as multipart form-data directly
import StatusCard from "@/components/dealer-onboarding/StatusCard";
import SubmissionSuccess from "@/components/dealer-onboarding/SubmissionSuccess";
import styles from "./page.module.css";

export default function DealerOnboardingPage() {
    const {
        loading,
        error,
        setError,
        submissionId,
        currentStep,
        onboardingStatusData,
        startApplication,
        submitBusinessDetails,
        checkStatus,
    } = useDealerOnboarding();

    // ── Page 1 Form State (Basic Info) ──
    const [basicInfo, setBasicInfo] = useState<BasicInfoData>({
        dealerName: "",
        contactName: "",
        email: "",
        phone: "",
    });
    const [basicErrors, setBasicErrors] = useState<Partial<BasicInfoData>>({});

    // ── Page 2 Form State (Business Details & Documents) ──
    const [bizData, setBizData] = useState<{
        tradeNumber: string;
        reraNumber: string;
        address: string;
        city: string;
        country: string;
        website: string;
        description: string;
    }>({
        tradeNumber: "",
        reraNumber: "",
        address: "",
        city: "Doha",
        country: "Qatar",
        website: "",
        description: "",
    });
    const [bizErrors, setBizErrors] = useState<Record<string, string>>({});

    // Documents state (single common document upload list)
    const [documentFiles, setDocumentFiles] = useState<File[]>([]);
    const [docError, setDocError] = useState<string | null>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    // ── Handlers Page 1 ──
    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBasicInfo((prev) => ({ ...prev, [name]: value }));
        if (basicErrors[name as keyof BasicInfoData]) {
            setBasicErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleBasicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Partial<BasicInfoData> = {};
        if (!basicInfo.dealerName.trim()) errs.dealerName = "Agency Name is required";
        if (!basicInfo.contactName.trim()) errs.contactName = "Contact Person is required";
        if (!basicInfo.email.trim()) {
            errs.email = "Business Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
            errs.email = "Invalid email format";
        }
        if (!basicInfo.phone.trim()) errs.phone = "Phone Number is required";

        if (Object.keys(errs).length > 0) {
            setBasicErrors(errs);
            return;
        }

        try {
            await startApplication(basicInfo);
        } catch (err) {
            // Error handled in hook
        }
    };

    // ── Handlers Page 2 ──
    const handleBizChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setBizData((prev) => ({ ...prev, [name]: value }));
        if (bizErrors[name]) {
            setBizErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        setDocumentFiles((prev) => [...prev, ...newFiles]);
        setDocError(null);
        // Reset input so same file can be re-added if removed
        e.target.value = "";
    };

    const handleRemoveDoc = (index: number) => {
        setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleBizSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs: Record<string, string> = {};
        if (!bizData.tradeNumber.trim()) errs.tradeNumber = "Trade License Number is required";
        if (!bizData.address.trim()) errs.address = "Registered Address is required";
        if (!bizData.city.trim()) errs.city = "City is required";
        if (!bizData.country.trim()) errs.country = "Country is required";

        if (Object.keys(errs).length > 0) {
            setBizErrors(errs);
            return;
        }

        // At least one document is required
        if (documentFiles.length === 0) {
            setDocError("Please upload at least one document before submitting.");
            return;
        }

        // Build multipart FormData — backend expects documents as file uploads
        const formData = new FormData();
        formData.append("tradeNumber", bizData.tradeNumber);
        if (bizData.reraNumber) formData.append("reraNumber", bizData.reraNumber);
        formData.append("address", bizData.address);
        formData.append("city", bizData.city);
        formData.append("country", bizData.country);
        if (bizData.website) formData.append("website", bizData.website);
        if (bizData.description) formData.append("description", bizData.description);
        documentFiles.forEach((file) => formData.append("documents", file));

        try {
            await submitBusinessDetails(formData);
        } catch (err) {
            // Error handled in hook
        }
    };

    return (
        <div className={styles.mainContainer}>
            {error && (
                <div style={{ padding: "16px 24px 0 24px", maxWidth: "1080px", margin: "0 auto" }}>
                    <div className={styles.errorBanner}>
                        <span>{error}</span>
                        <button onClick={() => setError(null)}>
                            <FiX />
                        </button>
                    </div>
                </div>
            )}

            {/* ── STATUS VIEW (Step 4) ── */}
            {currentStep === 4 && onboardingStatusData ? (
                <div style={{ padding: "40px 20px", display: "flex", justifyContent: "center" }}>
                    <StatusCard
                        data={onboardingStatusData}
                        onRefresh={() => checkStatus()}
                        loading={loading}
                    />
                </div>
            ) : currentStep === 3 ? (
                /* ── SUBMISSION SUCCESS (Step 3) ── */
                <div style={{ padding: "40px 20px", display: "flex", justifyContent: "center" }}>
                    <SubmissionSuccess
                        submissionId={submissionId!}
                        onCheckStatus={() => checkStatus(submissionId!)}
                    />
                </div>
            ) : currentStep === 2 ? (
                /* ── PAGE 2: EDIT / APPLICATION DETAILS ── */
                <div className={styles.editContainer}>
                    <div className={styles.editPageHeader}>
                        <h1 className={styles.editTitle}>Application Details</h1>
                        <p className={styles.editSubtitle}>
                            Please update the information below and submit your application.
                        </p>
                    </div>

                    <form onSubmit={handleBizSubmit}>
                        {/* Section 1: Agency Information (Prefilled / Readonly display) */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionHeading}>Agency Information</h2>
                            <div className={styles.grid2}>
                                <div>
                                    <label className={styles.fieldLabel}>
                                        Agency Name <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <FiHome className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            className={styles.textInput}
                                            value={basicInfo.dealerName}
                                            onChange={(e) =>
                                                setBasicInfo((prev) => ({
                                                    ...prev,
                                                    dealerName: e.target.value,
                                                }))
                                            }
                                            placeholder="Agency Name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        Contact Person <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <FiUser className={styles.inputIcon} />
                                        <input
                                            type="text"
                                            className={styles.textInput}
                                            value={basicInfo.contactName}
                                            onChange={(e) =>
                                                setBasicInfo((prev) => ({
                                                    ...prev,
                                                    contactName: e.target.value,
                                                }))
                                            }
                                            placeholder="Contact Person"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        Email <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <div className={styles.inputWrapper}>
                                        <FiMail className={styles.inputIcon} />
                                        <input
                                            type="email"
                                            className={styles.textInput}
                                            value={basicInfo.email}
                                            onChange={(e) =>
                                                setBasicInfo((prev) => ({
                                                    ...prev,
                                                    email: e.target.value,
                                                }))
                                            }
                                            placeholder="email@domain.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        Phone Number <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <div className={styles.phoneGroup}>
                                        <div className={styles.flagPrefix}>
                                            <img
                                                src="https://flagcdn.com/w40/qa.png"
                                                alt="Qatar"
                                                className={styles.flagIcon}
                                            />
                                            <span>+974</span>
                                        </div>
                                        <input
                                            type="tel"
                                            className={styles.phoneInputNoBorder}
                                            value={basicInfo.phone}
                                            onChange={(e) =>
                                                setBasicInfo((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value,
                                                }))
                                            }
                                            placeholder="Phone Number"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Business Details */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionHeading}>Business Details</h2>
                            <div className={styles.grid2}>
                                <div>
                                    <label className={styles.fieldLabel}>
                                        Trade License Number <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="tradeNumber"
                                        className={`${styles.textInput} ${bizErrors.tradeNumber ? styles.textInputError : ""
                                            }`}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.tradeNumber}
                                        onChange={handleBizChange}
                                        placeholder="e.g. 12345/2024"
                                        required
                                    />
                                    {bizErrors.tradeNumber && (
                                        <span className={styles.errorText}>{bizErrors.tradeNumber}</span>
                                    )}
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>RERA Number</label>
                                    <input
                                        type="text"
                                        name="reraNumber"
                                        className={styles.textInput}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.reraNumber}
                                        onChange={handleBizChange}
                                        placeholder="e.g. RERA-2024-67890"
                                    />
                                </div>

                                <div className={styles.fullWidth}>
                                    <label className={styles.fieldLabel}>
                                        Registered Address <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        className={`${styles.textInput} ${bizErrors.address ? styles.textInputError : ""
                                            }`}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.address}
                                        onChange={handleBizChange}
                                        placeholder="Street, Building, Office number"
                                        required
                                    />
                                    {bizErrors.address && (
                                        <span className={styles.errorText}>{bizErrors.address}</span>
                                    )}
                                </div>
                            </div>

                            <div className={`${styles.grid3} ${styles.fullWidth}`} style={{ marginTop: "20px" }}>
                                <div>
                                    <label className={styles.fieldLabel}>
                                        City <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        className={styles.textInput}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.city}
                                        onChange={handleBizChange}
                                        placeholder="Doha"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>
                                        Country <span className={styles.requiredStar}>*</span>
                                    </label>
                                    <select
                                        name="country"
                                        className={styles.selectInput}
                                        value={bizData.country}
                                        onChange={handleBizChange}
                                        required
                                    >
                                        <option value="Qatar">Qatar</option>
                                        <option value="United Arab Emirates">United Arab Emirates</option>
                                        <option value="Saudi Arabia">Saudi Arabia</option>
                                        <option value="Kuwait">Kuwait</option>
                                        <option value="Bahrain">Bahrain</option>
                                        <option value="Oman">Oman</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={styles.fieldLabel}>Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        className={styles.textInput}
                                        style={{ paddingLeft: "14px" }}
                                        value={bizData.website}
                                        onChange={handleBizChange}
                                        placeholder="https://agency.qa"
                                    />
                                </div>
                            </div>

                            <div className={styles.fullWidth} style={{ marginTop: "20px" }}>
                                <label className={styles.fieldLabel}>Business Description</label>
                                <textarea
                                    name="description"
                                    className={styles.textarea}
                                    value={bizData.description}
                                    onChange={handleBizChange}
                                    maxLength={500}
                                    placeholder="Brief description of your real estate agency..."
                                />
                                <div className={styles.charCount}>
                                    {bizData.description.length} / 500
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Documents Upload */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionHeading}>
                                Documents <span className={styles.requiredStar}>*</span>
                            </h2>
                            <p className={styles.sectionSubHeading}>
                                Upload at least one document for agency verification (Trade License, RERA Certificate, etc.)
                            </p>

                            {/* Drop Zone */}
                            <div
                                className={styles.fileUploadArea}
                                onClick={() => docInputRef.current?.click()}
                                style={docError ? { borderColor: "#dc2626" } : undefined}
                            >
                                <FiUploadCloud className={styles.uploadIcon} />
                                <span className={styles.uploadText}>Click to upload documents</span>
                                <span className={styles.uploadHint}>PDF, PNG, JPG — you can add multiple files</span>
                                <input
                                    ref={docInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    style={{ display: "none" }}
                                    onChange={handleDocFileChange}
                                />
                            </div>

                            {docError && (
                                <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "8px" }}>
                                    {docError}
                                </p>
                            )}

                            {/* Uploaded file list */}
                            {documentFiles.length > 0 && (
                                <div className={styles.fileListGrid} style={{ marginTop: "16px" }}>
                                    {documentFiles.map((file, idx) => (
                                        <div key={idx} className={styles.fileItemCard}>
                                            <FiFileText style={{ color: "#8A1538", fontSize: "20px", flexShrink: 0 }} />
                                            <div className={styles.fileMetaInfo}>
                                                <span className={styles.fileNameText}>{file.name}</span>
                                                <span className={styles.fileSizeText}>{formatFileSize(file.size)}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.removeFileBtn}
                                                onClick={() => handleRemoveDoc(idx)}
                                                aria-label="Remove file"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Buttons */}
                        <div className={styles.footerNav}>
                            <button
                                type="button"
                                className={styles.backBtn}
                                onClick={() => window.location.reload()}
                            >
                                <FiArrowLeft /> Back
                            </button>

                            <button
                                type="submit"
                                className={styles.resubmitBtn}
                                disabled={loading}
                            >
                                {loading ? (
                                    "Submitting Application..."
                                ) : (
                                    <>
                                        Submit Application <FiSend />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Site Footer */}
                    <footer className={styles.siteFooter}>
                        <span>© 2026 Villas Qatar. All rights reserved.</span> |{" "}
                        <a href="#">Terms of Service</a> | <a href="#">Privacy Policy</a> |{" "}
                        <a href="#">Contact Us</a>
                    </footer>
                </div>
            ) : (
                /* ── PAGE 1: SPLIT HERO & REGISTER YOUR AGENCY FORM ── */
                <div className={styles.splitLayout}>
                    {/* Left Form Panel */}
                    <div className={styles.leftPanel}>
                        <h1 className={styles.title}>
                            Register <span className={styles.highlightTitle}>Your Agency</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Let's get started! Please enter your agency and contact details to begin your
                            onboarding journey.
                        </p>

                        <form onSubmit={handleBasicSubmit}>
                            {/* Agency Name */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>Agency Name</label>
                                <div className={styles.inputWrapper}>
                                    <FiHome className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="dealerName"
                                        className={`${styles.textInput} ${basicErrors.dealerName ? styles.textInputError : ""
                                            }`}
                                        placeholder="Enter agency / company name"
                                        value={basicInfo.dealerName}
                                        onChange={handleBasicChange}
                                        required
                                    />
                                </div>
                                {basicErrors.dealerName && (
                                    <span className={styles.errorText}>{basicErrors.dealerName}</span>
                                )}
                            </div>

                            {/* Contact Person */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>Contact Person</label>
                                <div className={styles.inputWrapper}>
                                    <FiUser className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="contactName"
                                        className={`${styles.textInput} ${basicErrors.contactName ? styles.textInputError : ""
                                            }`}
                                        placeholder="Enter full name of contact person"
                                        value={basicInfo.contactName}
                                        onChange={handleBasicChange}
                                        required
                                    />
                                </div>
                                {basicErrors.contactName && (
                                    <span className={styles.errorText}>{basicErrors.contactName}</span>
                                )}
                            </div>

                            {/* Business Email */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>Business Email</label>
                                <div className={styles.inputWrapper}>
                                    <FiMail className={styles.inputIcon} />
                                    <input
                                        type="email"
                                        name="email"
                                        className={`${styles.textInput} ${basicErrors.email ? styles.textInputError : ""
                                            }`}
                                        placeholder="Enter business email address"
                                        value={basicInfo.email}
                                        onChange={handleBasicChange}
                                        required
                                    />
                                </div>
                                {basicErrors.email && (
                                    <span className={styles.errorText}>{basicErrors.email}</span>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className={styles.formGroup}>
                                <label className={styles.fieldLabel}>Phone Number</label>
                                <div className={styles.phoneGroup}>
                                    <div className={styles.flagPrefix}>
                                        <img
                                            src="https://flagcdn.com/w40/qa.png"
                                            alt="Qatar"
                                            className={styles.flagIcon}
                                        />
                                        <span>+974</span>
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className={styles.phoneInputNoBorder}
                                        placeholder="Enter phone number"
                                        value={basicInfo.phone}
                                        onChange={handleBasicChange}
                                        required
                                    />
                                </div>
                                {basicErrors.phone && (
                                    <span className={styles.errorText}>{basicErrors.phone}</span>
                                )}
                            </div>

                            {/* Submit Row */}
                            <div className={styles.submitRow}>
                                <button
                                    type="submit"
                                    className={styles.continueBtn}
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : <>Continue <FiArrowRight /></>}
                                </button>

                                <div className={styles.securityNote}>
                                    <FiShield className={styles.securityIcon} />
                                    <span>Your information is secure and will not be shared.</span>
                                </div>
                            </div>
                        </form>

                        <div className={styles.statusCheckLink}>
                            Already applied?{" "}
                            <Link href="/dealer-onboarding/status">Check Application Status</Link>
                        </div>
                    </div>

                    {/* Right Hero Image Panel */}
                    <div className={styles.rightPanel}>
                        <>
                            <svg width="0" height="0">
                                <defs>
                                    <clipPath id="heroClip" clipPathUnits="objectBoundingBox">
                                        <path
                                            d="
                    M0.22,0
                    C0.18,0.08 0,0.47 0,0.5
                    C0,0.68 0.5,1.7 0.22,1
                    L1,1
                    L1,0
                    Z
                "
                                        />
                                    </clipPath>
                                </defs>
                            </svg>

                            <div className={styles.heroImageContainer}>
                                <Image
                                    src="/dealer-onboard-hero.jpeg"
                                    alt="Villas Qatar Onboarding"
                                    fill
                                    priority
                                    className={styles.heroImg}
                                />
                                <div className={styles.heroOverlay} />
                            </div>
                        </>
                    </div>
                </div>
            )}
        </div>
    );
}
