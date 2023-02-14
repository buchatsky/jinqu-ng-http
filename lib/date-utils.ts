export function dateToISOLocalString(date: Date): string {
    function padNum(num: number, digits: number): string {
        let strNum = String(num);
        //strNum = '0'.repeat(digits - strNum.length) + strNum;
        while (strNum.length < digits) {
            strNum = '0' + strNum;
        }
        return strNum;
    }

    const [month, day, year] = [
        date.getMonth() + 1,
        date.getDate(),
        date.getFullYear(),
    ];
    const [hours, minutes, seconds, milliseconds] = [
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
    ];

    let tzOffset = date.getTimezoneOffset();
    let tzOffsetStr: string;
    if (tzOffset !== 0) {
        const tzSign = tzOffset > 0 ? '-' : '+';
        tzOffset = Math.abs(tzOffset);
        const tzMins = tzOffset % 60;
        const tzHours = (tzOffset - tzMins) / 60;
        tzOffsetStr = tzSign + padNum(tzHours, 2) + ':' + padNum(tzMins, 2);
    } else {
        tzOffsetStr = 'Z';
    }

    const dtStr = `${String(year)}-${padNum(month, 2)}-${padNum(day, 2)}T${padNum(hours, 2)}:${padNum(minutes, 2)}:${padNum(seconds, 2)}.${padNum(milliseconds, 3)}`;
    return dtStr + tzOffsetStr;
}