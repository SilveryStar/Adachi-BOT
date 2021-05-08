const background = {
    template: '#background',
    props: {
        uid: {
            type: Number
        },
        character: {
            type: Number
        }
    },
    computed: {
        image() {
            return "http://adachi-bot.oss-cn-beijing.aliyuncs.com/characters/card/" + this.character + ".png";
        }
    }
};

const baseInfo = {
    template: '#base-info',
    data() {
        return {
            numberCN: ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾']
        }
    },
    props: {
        name: {
            type: String
        },
        element: {
            type: String
        },
        level: {
            type: Number
        },
        fetter: {
            type: Number
        },
        constellation: {
            type: Number
        }
    },
    computed: {
        fetterCN() {
            return this.numberCN[this.fetter];
        },
        constellationCN() {
            return this.numberCN[this.constellation];
        }
    }
};

const artifact = {
    template: '#artifact',
    props: {
        detail: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    computed: {
        rarity() {
            let star = "★";
            return star.repeat(this.detail.rarity);
        }
    }
};

const emptyBox = {
    template: '#empty-box',
    props: ['pos'],
    computed: {
        image() {
            return "http://adachi-bot.oss-cn-beijing.aliyuncs.com/item/" + this.pos + ".png";
        }
    }
};

const reliquaries = {
    template: '#reliquaries',
    props: {
        artifacts: {
            type: Array
        }
    },
    components: {
        artifact,
        emptyBox
    }
};

const weaponBox = {
    template: '#weapon-box',
    data() {
        return {
            len: 0
        }
    },
    props: {
        weapon: {
            type: Object,
            default() {
                return {
                    level: 1,
                    affix_level: 1,
                    desc: '',
                    name: ''
                }
            }
        },
        len: {
            type: Number,
            default() {
                return 0;
            }
        }
    },
    computed: {
        rarity() {
            let star = "★";
            console.log(this.len);
            return star.repeat(this.weapon.rarity);
        }
    }
};
