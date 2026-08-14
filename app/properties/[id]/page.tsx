"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    FiArrowLeft,
    FiMapPin,
    FiMaximize2,
    FiCalendar,
    FiPhone,
    FiMessageSquare,
    FiCheckCircle,
    FiUser,
    FiTag,
    FiLayers,
    FiInfo,
    FiImage,
    FiHome,
    FiShield,
    FiCheck,
    FiGrid,
    FiCompass,
    FiClock,
    FiExternalLink,
    FiClipboard,
    FiStar,
    FiCreditCard,
} from "react-icons/fi";
import { AppLayout, Button, Badge } from "@/components/ui";
import PropertyMap from "@/components/property/PropertyMap";
import FeaturePropertyModal from "@/components/property/FeaturePropertyModal/FeaturePropertyModal";
import PropertyAnalyticsSection from "@/components/property/PropertyAnalyticsSection";
import { propertyService, PropertyDetail } from "@/services/property.service";
import InquiriesSection from "@/components/inquiry/InquiriesSection";
import styles from "./page.module.css";

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const t = useTranslations("property.detail");

    const [property, setProperty] = useState<PropertyDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState<boolean>(false);
    const [isPaying, setIsPaying] = useState<boolean>(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            void fetchPropertyDetail(id);
        }
    }, [id]);

    const fetchPropertyDetail = async (propertyId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await propertyService.getPropertyById(propertyId);
            setProperty(data);
            setSelectedPhotoIndex(0);
        } catch (err: unknown) {
            const serviceError = err as { response?: { data?: { message?: string } } };
            console.error("Failed to fetch property details:", err);
            setError(serviceError.response?.data?.message || t("loadError"));
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE": return "success";
            case "PENDING": return "warning";
            case "RESUBMITED": return "warning";
            case "PENDING_PAYMENT": return "warning";
            case "REJECTED": return "danger";
            case "SOLD": return "info";
            case "INACTIVE":
            default: return "default";
        }
    };

    const handleMakePayment = async () => {
        if (!property || isPaying) return;
        setPaymentError(null);
        setPaymentNotice(null);
        setIsPaying(true);
        try {
            const origin = window.location.origin;
            const result = await propertyService.makePayment({
                listingId: property.id,
                successUrl: `${origin}/payments/success?listingId=${property.id}`,
                failedUrl: `${origin}/payments/failed?listingId=${property.id}`,
            });
            if (result.activated) {
                setPaymentNotice(t("paymentActivated"));
                void fetchPropertyDetail(property.id);
            } else if (result.paymentUrl) {
                window.location.assign(result.paymentUrl);
                return;
            } else {
                setPaymentError(t("paymentGenericError"));
            }
        } catch (err: unknown) {
            const serviceError = err as { response?: { data?: { message?: string } } };
            setPaymentError(serviceError.response?.data?.message || t("paymentGenericError"));
        } finally {
            setIsPaying(false);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className={styles.container}>
                    <div className={styles.breadcrumbs}>
                        <Link href="/dashboard">{t("breadcrumb.dashboard")}</Link>
                        <span>&gt;</span>
                        <Link href="/properties">{t("breadcrumb.properties")}</Link>
                        <span>&gt;</span>
                        <span>{t("breadcrumb.loading")}</span>
                    </div>

                    <div className={styles.headerCard}>
                        <div className={styles.headerMain}>
                            <div className={styles.title} style={{ width: "60%", height: 32, background: "#e2e8f0", borderRadius: 6 }} />
                            <div className={styles.locationSub} style={{ width: "40%", height: 20, background: "#e2e8f0", borderRadius: 4 }} />
                        </div>
                    </div>

                    <div className={styles.layoutGrid}>
                        <div className={styles.mainColumn}>
                            <div className={styles.sectionCard} style={{ height: 420, background: "#e2e8f0", borderRadius: 12 }} />
                        </div>
                        <div className={styles.sideColumn}>
                            <div className={styles.sectionCard} style={{ height: 280, background: "#e2e8f0", borderRadius: 12 }} />
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (error || !property) {
        return (
            <AppLayout>
                <div className={styles.container}>
                    <div className={styles.breadcrumbs}>
                        <Link href="/dashboard">{t("breadcrumb.dashboard")}</Link>
                        <span>&gt;</span>
                        <Link href="/properties">{t("breadcrumb.properties")}</Link>
                        <span>&gt;</span>
                        <span>{t("breadcrumb.error")}</span>
                    </div>

                    <div className={styles.errorContainer}>
                        <FiInfo size={48} color="var(--primary)" />
                        <h2 className={styles.errorTitle}>{t("notFoundTitle")}</h2>
                        <p className={styles.errorSubtext}>{error || t("notFoundSubtext")}</p>
                        <Button onClick={() => router.push("/properties")} leftIcon={<FiArrowLeft />}>
                            {t("backToProperties")}
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const photos = property.photos || [];
    const activePhoto = photos[selectedPhotoIndex] || photos[0];
    const creator = property.createdBy;
    const creatorInitials = creator?.name
        ? creator.name
            .split(" ")
            .map((namePart) => namePart[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : "DE";

    const fullAddressLine = [property.addressLine1, property.addressLine2].filter(Boolean).join(", ");
    const localityLine = [property.areaName, property.municipality?.name, property.country].filter(Boolean).join(", ");
    const hasCoordinates = property.latitude !== undefined && property.longitude !== undefined;
    const openInMapsHref = hasCoordinates
        ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
        : "#";

    return (
        <AppLayout>
            <div className={styles.container}>
                <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                    <Link href="/dashboard">{t("breadcrumb.dashboard")}</Link>
                    <span>&gt;</span>
                    <Link href="/properties">{t("breadcrumb.properties")}</Link>
                    <span>&gt;</span>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>{property.propertyName}</span>
                </nav>

                <button className={styles.backBtn} onClick={() => router.push("/properties")}>
                    <FiArrowLeft size={16} /> {t("backToProperties")}
                </button>

                <div className={styles.headerCard}>
                    <div className={styles.headerMain}>
                        <div className={styles.titleRow}>
                            <h1 className={styles.title}>{property.propertyName}</h1>
                            <div className={styles.badgeGroup}>
                                <Badge variant={getStatusVariant(property.status)}>
                                    {property.status}
                                </Badge>
                                <span className={styles.purposeBadge}>{property.purpose}</span>
                                <span className={styles.typeBadge}>{property.type?.title}</span>
                                {property.isFeatured && (
                                    <span className={styles.featuredBadge}>
                                        <FiStar size={12} /> {t("featured")}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={styles.locationSub}>
                            <FiMapPin size={16} />
                            <span>
                                {fullAddressLine}
                                {localityLine ? `, ${localityLine}` : ""}
                            </span>
                            <span style={{ color: "var(--text-light)", marginLeft: 8 }}>
                                ({t("referenceLabel", { code: property.referenceCode })})
                            </span>
                        </div>
                    </div>

                    <div className={styles.priceSection}>
                        <span className={styles.priceLabel}>{t("listedPrice")}</span>
                        <div className={styles.priceValue}>
                            {property.price?.toLocaleString()} QAR
                        </div>
                        {property.priceNegotiable && (
                            <span className={styles.negotiableChip}>{t("negotiable")}</span>
                        )}

                        {property.status?.toUpperCase() === "ACTIVE" && (
                            <button
                                type="button"
                                className={styles.featureBtn}
                                onClick={() => setIsFeatureModalOpen(true)}
                            >
                                <FiStar size={14} />
                                {property.isFeatured ? t("extendFeatured") : t("featureThis")}
                            </button>
                        )}

                        {property.status?.toUpperCase() === "PENDING_PAYMENT" && (
                            <button
                                type="button"
                                className={styles.payBtn}
                                onClick={() => void handleMakePayment()}
                                disabled={isPaying}
                            >
                                <FiCreditCard size={14} />
                                {isPaying ? t("processing") : t("makePayment")}
                            </button>
                        )}
                    </div>
                </div>

                {paymentError && <div className={styles.paymentErrorBanner}>{paymentError}</div>}
                {paymentNotice && <div className={styles.paymentNoticeBanner}>{paymentNotice}</div>}

                <div className={styles.contentStack}>
                <div className={styles.layoutGrid}>
                    <div className={styles.mainColumn}>

                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiImage size={18} /> {t("gallery", { count: photos.length })}
                            </h2>

                            <div className={styles.galleryWrapper}>
                                <div className={styles.mainPhotoView}>
                                    {activePhoto?.url ? (
                                        <img
                                            src={activePhoto.url}
                                            alt={activePhoto.caption || property.propertyName}
                                            className={styles.mainPhotoImg}
                                        />
                                    ) : (
                                        <div className={styles.photoPlaceholder}>
                                            <FiImage size={48} />
                                            <span>{t("noImage")}</span>
                                        </div>
                                    )}
                                    {activePhoto?.caption && (
                                        <div className={styles.photoCaption}>
                                            {activePhoto.caption}
                                        </div>
                                    )}
                                </div>

                                {photos.length > 1 && (
                                    <div className={styles.thumbnailsRow}>
                                        {photos.map((photo, index) => (
                                            <button
                                                key={photo.id || index}
                                                type="button"
                                                className={`${styles.thumbnailBtn} ${selectedPhotoIndex === index ? styles.thumbnailBtnActive : ""}`}
                                                onClick={() => setSelectedPhotoIndex(index)}
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={photo.caption || t("thumbnailAlt", { number: index + 1 })}
                                                    className={styles.thumbnailImg}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiGrid size={18} /> {t("specs")}
                            </h2>

                            <div className={styles.specsGrid}>
                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiHome /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>{t("bedrooms")}</span>
                                        <span className={styles.specValue}>{t("bedsSuffix", { count: property.bedrooms })}</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiHome /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>{t("bathrooms")}</span>
                                        <span className={styles.specValue}>{t("bathsSuffix", { count: property.bathrooms })}</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiMaximize2 /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>{t("area")}</span>
                                        <span className={styles.specValue}>{t("areaSuffix", { value: property.area })}</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiLayers /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>{t("livingRooms")}</span>
                                        <span className={styles.specValue}>{property.livingRooms}</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiCompass /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>{t("parking")}</span>
                                        <span className={styles.specValue}>{t("parkingSuffix", { count: property.parkingSpaces })}</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiGrid /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>{t("floorInfo")}</span>
                                        <span className={styles.specValue}>{t("floorSuffix", { floor: property.floorNumber, total: property.totalFloors })}</span>
                                    </div>
                                </div>

                                {property.yearBuilt && (
                                    <div className={styles.specItem}>
                                        <div className={styles.specIcon}><FiCalendar /></div>
                                        <div className={styles.specInfo}>
                                            <span className={styles.specLabel}>{t("yearBuilt")}</span>
                                            <span className={styles.specValue}>{property.yearBuilt}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiShield /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>{t("furnishing")}</span>
                                        <span className={styles.specValue}>{property.furnishing?.title || t("notAvailable")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiInfo size={18} /> {t("description")}
                            </h2>
                            <p className={styles.descriptionText}>{property.description}</p>
                        </div>

                        {hasCoordinates && (
                            <div className={styles.sectionCard}>
                                <h2 className={styles.sectionTitle}>
                                    <FiMapPin size={18} /> {t("location")}
                                </h2>

                                <div className={styles.locationMapContent}>
                                    <div className={styles.locationAddressBlock}>
                                        {fullAddressLine && <span className={styles.locationAddressLine}>{fullAddressLine}</span>}
                                        {localityLine && <span className={styles.locationAddressLine}>{localityLine}</span>}
                                    </div>

                                    <PropertyMap
                                        latitude={property.latitude}
                                        longitude={property.longitude}
                                        propertyName={property.propertyName}
                                    />

                                    <div className={styles.locationActions}>
                                        <a
                                            href={openInMapsHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.locationMapLink}
                                        >
                                            <FiExternalLink /> {t("openInMaps")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {property.amenities && property.amenities.length > 0 && (
                            <div className={styles.sectionCard}>
                                <h2 className={styles.sectionTitle}>
                                    <FiCheckCircle size={18} /> {t("amenities")}
                                </h2>
                                <div className={styles.chipsGrid}>
                                    {property.amenities.map((amenity, index) => (
                                        <span key={index} className={styles.chip}>
                                            <FiCheck className={styles.chipIcon} /> {amenity.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {property.nearbyTags && property.nearbyTags.length > 0 && (
                            <div className={styles.sectionCard}>
                                <h2 className={styles.sectionTitle}>
                                    <FiTag size={18} /> {t("nearby")}
                                </h2>
                                <div className={styles.chipsGrid}>
                                    {property.nearbyTags.map((tag) => (
                                        <span key={tag.id} className={styles.chip}>
                                            <FiMapPin className={styles.chipIcon} />
                                            {tag.title}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(property.extraProperties || property.otherFeatures) && (
                            <div className={styles.sectionCard}>
                                <h2 className={styles.sectionTitle}>
                                    <FiLayers size={18} /> {t("additionalFeatures")}
                                </h2>
                                <div className={styles.locationBox}>
                                    {property.extraProperties?.privatePool !== undefined && (
                                        <div className={styles.locationRow}>
                                            <span className={styles.locationLabel}>{t("privatePool")}</span>
                                            <span className={styles.locationVal}>{property.extraProperties.privatePool ? t("yes") : t("no")}</span>
                                        </div>
                                    )}
                                    {property.extraProperties?.gardenAreaSqm !== undefined && (
                                        <div className={styles.locationRow}>
                                            <span className={styles.locationLabel}>{t("gardenArea")}</span>
                                            <span className={styles.locationVal}>{t("areaSuffix", { value: property.extraProperties.gardenAreaSqm })}</span>
                                        </div>
                                    )}
                                    {property.otherFeatures && (
                                        <div className={styles.locationRow}>
                                            <span className={styles.locationLabel}>{t("otherFeatures")}</span>
                                            <span className={styles.locationVal}>{property.otherFeatures}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.sideColumn}>
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiUser size={18} /> {t("contactInfo")}
                            </h2>

                            <div className={styles.contactCard}>
                                {creator && (
                                    <div className={styles.creatorHeader}>
                                        <div className={styles.creatorAvatar}>{creatorInitials}</div>
                                        <div className={styles.creatorDetails}>
                                            <span className={styles.creatorName}>{creator.name}</span>
                                            <span className={styles.creatorRole}>{creator.role} ({creator.email})</span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.contactList}>
                                    {property.contactPhone && (
                                        <div className={styles.contactItem}>
                                            <FiPhone className={styles.contactIcon} />
                                            <span>{t("phone")}: <strong>{property.contactPhone}</strong></span>
                                        </div>
                                    )}
                                    {property.contactWhatsapp && (
                                        <div className={styles.contactItem}>
                                            <FiMessageSquare className={styles.contactIcon} />
                                            <span>{t("whatsapp")}: <strong>{property.contactWhatsapp}</strong></span>
                                        </div>
                                    )}
                                    {property.contactVerified !== undefined && (
                                        <div className={styles.contactItem}>
                                            <FiCheckCircle className={styles.contactIcon} />
                                            <span>{t("contactVerified")}: <strong>{property.contactVerified ? t("yes") : t("no")}</strong></span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.contactBtnGroup}>
                                    {property.contactPhone && (
                                        <a href={`tel:${property.contactPhone}`} className={styles.callBtn}>
                                            <FiPhone /> {t("callContact")}
                                        </a>
                                    )}
                                    {property.contactWhatsapp && (
                                        <a
                                            href={`https://wa.me/${property.contactWhatsapp.replace(/[^0-9]/g, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.whatsappBtn}
                                        >
                                            <FiMessageSquare /> {t("whatsapp")}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiClock size={18} /> {t("listingDetails")}
                            </h2>

                            <div className={styles.metaList}>
                                <div className={styles.metaRow}>
                                    <span>{t("listingStatus")}</span>
                                    <span>{property.status}</span>
                                </div>
                                {property.submissionCount !== undefined && (
                                    <div className={styles.metaRow}>
                                        <span>{t("submissionCount")}</span>
                                        <span>{property.submissionCount}</span>
                                    </div>
                                )}
                                <div className={styles.metaRow}>
                                    <span>{t("createdDate")}</span>
                                    <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span>{t("lastUpdated")}</span>
                                    <span>{new Date(property.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Analytics Section ── */}
                <PropertyAnalyticsSection listingId={property.id} />

                {/* ── Inquiries Section ── */}
                <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}>
                        <FiClipboard size={18} /> {t("visitInquiries")}
                    </h2>
                    <InquiriesSection />
                </div>
                </div>{/* end contentStack */}
            </div>

            <FeaturePropertyModal
                isOpen={isFeatureModalOpen}
                onClose={() => setIsFeatureModalOpen(false)}
                listingId={property.id}
                propertyName={property.propertyName}
                isCurrentlyFeatured={property.isFeatured}
                onFeatured={() => void fetchPropertyDetail(id)}
            />
        </AppLayout>
    );
}
