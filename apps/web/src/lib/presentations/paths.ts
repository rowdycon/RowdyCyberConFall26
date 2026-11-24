// URL helpers shared by server and client components. Keep this file free of
// heavy imports (like manifests.json) so client bundles stay small.

export const PRESENTATIONS_SITE_URL = "https://frutiger.rowdycybercon.org";

export const presentationHref = (slug: string) => `/presentations/${slug}`;

const assetBase = (slug: string) => `/presentations/${slug}`;

export const slideSrc = (slug: string, n: number) =>
	`${assetBase(slug)}/slides/${n}.webp`;

export const thumbSrc = (slug: string, n: number) =>
	`${assetBase(slug)}/thumbs/${n}.webp`;

export const coverSrc = (slug: string) => `${assetBase(slug)}/cover.webp`;

export const pdfSrc = (slug: string) => `${assetBase(slug)}/slides.pdf`;

export const pdfDownloadName = (slug: string) =>
	`rowdy-cybercon-2026-${slug}.pdf`;
