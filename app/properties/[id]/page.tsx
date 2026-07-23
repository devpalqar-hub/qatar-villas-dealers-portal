"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
} from "react-icons/fi";
import { AppLayout, Button, Badge } from "@/components/ui";
import { propertyService, PropertyDetail } from "@/services/property.service";
import styles from "./page.module.css";

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [property, setProperty] = useState<PropertyDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

    useEffect(() => {
        if (id) {
            fetchPropertyDetail(id);
        }
    }, [id]);

    const fetchPropertyDetail = async (propertyId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await propertyService.getPropertyById(propertyId);
            setProperty(data);
            setSelectedPhotoIndex(0);
        } catch (err: any) {
            console.error("Failed to fetch property details:", err);
            setError(err.response?.data?.message || "Failed to load property details.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status?.toUpperCase()) {
            case "ACTIVE": return "success";
            case "PENDING": return "warning";
            case "RESUBMITED": return "warning";
            case "REJECTED": return "danger";
            case "SOLD": return "info";
            case "INACTIVE":
            default: return "default";
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className={styles.container}>
                    <div className={styles.breadcrumbs}>
                        <Link href="/dashboard">Dashboard</Link>
                        <span>&gt;</span>
                        <Link href="/properties">Properties</Link>
                        <span>&gt;</span>
                        <span>Loading...</span>
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
                        <Link href="/dashboard">Dashboard</Link>
                        <span>&gt;</span>
                        <Link href="/properties">Properties</Link>
                        <span>&gt;</span>
                        <span>Error</span>
                    </div>

                    <div className={styles.errorContainer}>
                        <FiInfo size={48} color="var(--primary)" />
                        <h2 className={styles.errorTitle}>Property Not Found</h2>
                        <p className={styles.errorSubtext}>{error || "The requested property listing could not be found."}</p>
                        <Button onClick={() => router.push("/properties")} leftIcon={<FiArrowLeft />}>
                            Back to Properties
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
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
        : "DE";

    return (
        <AppLayout>
            <div className={styles.container}>
                {/* Breadcrumbs & Navigation */}
                <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <span>&gt;</span>
                    <Link href="/properties">Properties</Link>
                    <span>&gt;</span>
                    <span style={{ color: "var(--text)", fontWeight: 500 }}>{property.propertyName}</span>
                </nav>

                <button className={styles.backBtn} onClick={() => router.push("/properties")}>
                    <FiArrowLeft size={16} /> Back to Properties
                </button>

                {/* Header Card */}
                <div className={styles.headerCard}>
                    <div className={styles.headerMain}>
                        <div className={styles.titleRow}>
                            <h1 className={styles.title}>{property.propertyName}</h1>
                            <div className={styles.badgeGroup}>
                                <Badge variant={getStatusVariant(property.status)}>
                                    {property.status}
                                </Badge>
                                <span className={styles.purposeBadge}>{property.purpose}</span>
                                <span className={styles.typeBadge}>{property.type}</span>
                            </div>
                        </div>

                        <div className={styles.locationSub}>
                            <FiMapPin size={16} />
                            <span>
                                {property.addressLine1}
                                {property.addressLine2 ? `, ${property.addressLine2}` : ""}, {property.areaName}, {property.municipality}
                                {property.country ? `, ${property.country}` : ""}
                            </span>
                            <span style={{ color: "var(--text-light)", marginLeft: 8 }}>
                                (REF: {property.id.substring(0, 10)})
                            </span>
                        </div>
                    </div>

                    <div className={styles.priceSection}>
                        <span className={styles.priceLabel}>Listed Price</span>
                        <div className={styles.priceValue}>
                            {property.price?.toLocaleString()} QAR
                        </div>
                        {property.priceNegotiable && (
                            <span className={styles.negotiableChip}>Negotiable</span>
                        )}
                    </div>
                </div>

                {/* Main 2-Column Grid */}
                <div className={styles.layoutGrid}>
                    {/* Left Column: Gallery & Details */}
                    <div className={styles.mainColumn}>
                        {/* Media Photo Gallery Showcase */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiImage size={18} /> Property Gallery ({photos.length})
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
                                            <span>No Image Available</span>
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
                                                className={`${styles.thumbnailBtn} ${selectedPhotoIndex === index ? styles.thumbnailBtnActive : ""
                                                    }`}
                                                onClick={() => setSelectedPhotoIndex(index)}
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt={photo.caption || `Thumbnail ${index + 1}`}
                                                    className={styles.thumbnailImg}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Specifications Grid */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiGrid size={18} /> Key Specifications
                            </h2>

                            <div className={styles.specsGrid}>
                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiHome /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>Bedrooms</span>
                                        <span className={styles.specValue}>{property.bedrooms} Beds</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiHome /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>Bathrooms</span>
                                        <span className={styles.specValue}>{property.bathrooms} Baths</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiMaximize2 /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>Area</span>
                                        <span className={styles.specValue}>{property.area} sqm</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiLayers /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>Living Rooms</span>
                                        <span className={styles.specValue}>{property.livingRooms}</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiCompass /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>Parking</span>
                                        <span className={styles.specValue}>{property.parkingSpaces} Spaces</span>
                                    </div>
                                </div>

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiGrid /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>Floor Info</span>
                                        <span className={styles.specValue}>Floor {property.floorNumber} / {property.totalFloors}</span>
                                    </div>
                                </div>

                                {property.yearBuilt && (
                                    <div className={styles.specItem}>
                                        <div className={styles.specIcon}><FiCalendar /></div>
                                        <div className={styles.specInfo}>
                                            <span className={styles.specLabel}>Year Built</span>
                                            <span className={styles.specValue}>{property.yearBuilt}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.specItem}>
                                    <div className={styles.specIcon}><FiShield /></div>
                                    <div className={styles.specInfo}>
                                        <span className={styles.specLabel}>Furnishing</span>
                                        <span className={styles.specValue}>{property.furnishingStatus || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiInfo size={18} /> Property Description
                            </h2>
                            <p className={styles.descriptionText}>{property.description}</p>
                        </div>

                        {/* Amenities & Features */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div className={styles.sectionCard}>
                                <h2 className={styles.sectionTitle}>
                                    <FiCheckCircle size={18} /> Amenities & Features
                                </h2>
                                <div className={styles.chipsGrid}>
                                    {property.amenities.map((amenity, idx) => (
                                        <span key={idx} className={styles.chip}>
                                            <FiCheck className={styles.chipIcon} /> {amenity}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Nearby Places */}
                        {property.nearbyTags && property.nearbyTags.length > 0 && (
                            <div className={styles.sectionCard}>
                                <h2 className={styles.sectionTitle}>
                                    <FiTag size={18} /> Nearby Facilities
                                </h2>
                                <div className={styles.chipsGrid}>
                                    {property.nearbyTags.map((tag, idx) => (
                                        <span key={idx} className={styles.chip}>
                                            <FiMapPin className={styles.chipIcon} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Extra Properties & Features */}
                        {(property.extraProperties || property.otherFeatures) && (
                            <div className={styles.sectionCard}>
                                <h2 className={styles.sectionTitle}>
                                    <FiLayers size={18} /> Additional Features
                                </h2>
                                <div className={styles.locationBox}>
                                    {property.extraProperties?.privatePool !== undefined && (
                                        <div className={styles.locationRow}>
                                            <span className={styles.locationLabel}>Private Pool</span>
                                            <span className={styles.locationVal}>{property.extraProperties.privatePool ? "Yes" : "No"}</span>
                                        </div>
                                    )}
                                    {property.extraProperties?.gardenAreaSqm !== undefined && (
                                        <div className={styles.locationRow}>
                                            <span className={styles.locationLabel}>Garden Area</span>
                                            <span className={styles.locationVal}>{property.extraProperties.gardenAreaSqm} sqm</span>
                                        </div>
                                    )}
                                    {property.otherFeatures && (
                                        <div className={styles.locationRow}>
                                            <span className={styles.locationLabel}>Other Features</span>
                                            <span className={styles.locationVal}>{property.otherFeatures}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Contact & Metadata Sidebar */}
                    <div className={styles.sideColumn}>
                        {/* Contact & Dealer Card */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiUser size={18} /> Contact Information
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
                                            <span>Phone: <strong>{property.contactPhone}</strong></span>
                                        </div>
                                    )}
                                    {property.contactWhatsapp && (
                                        <div className={styles.contactItem}>
                                            <FiMessageSquare className={styles.contactIcon} />
                                            <span>WhatsApp: <strong>{property.contactWhatsapp}</strong></span>
                                        </div>
                                    )}
                                    {property.contactVerified !== undefined && (
                                        <div className={styles.contactItem}>
                                            <FiCheckCircle className={styles.contactIcon} />
                                            <span>Contact Verified: <strong>{property.contactVerified ? "Yes" : "No"}</strong></span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.contactBtnGroup}>
                                    {property.contactPhone && (
                                        <a href={`tel:${property.contactPhone}`} className={styles.callBtn}>
                                            <FiPhone /> Call Contact
                                        </a>
                                    )}
                                    {property.contactWhatsapp && (
                                        <a
                                            href={`https://wa.me/${property.contactWhatsapp.replace(/[^0-9]/g, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.whatsappBtn}
                                        >
                                            <FiMessageSquare /> WhatsApp
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Listing Metadata Card */}
                        <div className={styles.sectionCard}>
                            <h2 className={styles.sectionTitle}>
                                <FiClock size={18} /> Listing Details
                            </h2>

                            <div className={styles.metaList}>
                                <div className={styles.metaRow}>
                                    <span>Listing Status</span>
                                    <span>{property.status}</span>
                                </div>
                                {property.submissionCount !== undefined && (
                                    <div className={styles.metaRow}>
                                        <span>Submission Count</span>
                                        <span>{property.submissionCount}</span>
                                    </div>
                                )}
                                <div className={styles.metaRow}>
                                    <span>Created Date</span>
                                    <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.metaRow}>
                                    <span>Last Updated</span>
                                    <span>{new Date(property.updatedAt).toLocaleDateString()}</span>
                                </div>
                                {property.latitude && property.longitude && (
                                    <div className={styles.metaRow}>
                                        <span>Coordinates</span>
                                        <span>{property.latitude}, {property.longitude}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
