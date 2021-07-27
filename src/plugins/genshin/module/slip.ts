import { Redis } from "../../../bot";

interface SlipDetail {
    SlipInfo: string[];
}

class Slip {
    private readonly dbKey: string;
    private readonly SlipDetail: SlipDetail;

    constructor(id: number, SlipDetail: SlipDetail) {
        this.dbKey = `silvery-star.slip-${id}`;
        this.SlipDetail = SlipDetail;
    }

    private static randomInt(min: number, max: number): number {
        const range: number = max - min - 1;
        return min + Math.floor(Math.random() * range);
    }

    private async getDay() {
        return Math.floor(new Date().getTime() / 1000 / 3600 / 24 - 1 / 6);
    }

    public async get() {
        const lastSlip = await Redis.getString(this.dbKey);
        const today = (await this.getDay()).toString();
        if (lastSlip === today) {
            return '今天已经摇过了。明天再来看看吧…';
        }
        Redis.setString(this.dbKey, (await this.getDay()).toString());
        const index = Slip.randomInt(0, this.SlipDetail.SlipInfo.length);
        return Buffer.from(this.SlipDetail.SlipInfo[index], 'base64').toString();
    }

}

class SlipClass {
    private readonly SlipDetail: SlipDetail;

    constructor(data: SlipDetail) {
        this.SlipDetail = data;
    }

    public async get(qqID: number): Promise<string> {
        const slip: Slip = new Slip(qqID, this.SlipDetail);
        return await slip.get();
    }
}

export { SlipClass }