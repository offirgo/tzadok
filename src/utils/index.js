// Helper function for creating page URLs (for future routing)
export function createPageUrl(pageName) {
    return `/${pageName.toLowerCase()}`;
}

// Helper function for formatting time ago
export function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'עכשיו';
    if (minutes === 1) return 'לפני דקה';
    if (minutes < 60) return `לפני ${minutes} דקות`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'לפני שעה';
    return `לפני ${hours} שעות`;
}