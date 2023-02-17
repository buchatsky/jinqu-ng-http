export function dateToISOLocalString(date: Date): string {
    let tzOffset = date.getTimezoneOffset();
    const isoStr = new Date(date.getTime() - tzOffset * 60 * 1000).toISOString()
    if (tzOffset !== 0) {
        const tzSign = tzOffset > 0 ? '-' : '+';
        tzOffset = Math.abs(tzOffset);
        const tzMins = tzOffset % 60;
        const tzHours = (tzOffset - tzMins) / 60;
        return isoStr.slice(0, -1) + tzSign + ('0' + tzHours).slice(-2) + ':' + ('0' + tzMins).slice(-2);
    } else {
        return isoStr;
    }
}