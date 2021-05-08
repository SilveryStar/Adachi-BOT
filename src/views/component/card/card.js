const upper = {
    template: '#upper',
    props: {
        uid: Number,
        nickname: String,
        level: Number,
        profile: Number,
        exploration: {
            type: Object,
            default() {
                return [
                    {
                        level: 0,
                        exploration_percentage: 0
                    }
                ];
            }
        },
        stats: {
            type: Object,
            default() {
                return {
                    active_day_number: 0,
                    achievement_number: 0,
                    anemoculus_number: 0,
                    geoculus_number: 0,
                    avatar_number: 0,
                    common_chest_number: 0,
                    exquisite_chest_number: 0,
                    precious_chest_number: 0,
                    luxurious_chest_number: 0,
                    spiral_abyss: "0-0"
                };
            }
        }
    },
    computed: {
        Picture() {
            return "http://adachi-bot.oss-cn-beijing.aliyuncs.com/characters/profile/" + this.profile + ".png";
        },
        worldLevel() {
            if (this.level >= 55) {
                return 8;
            } else if (this.level >= 50) {
                return 7;
            } else if (this.level >= 45) {
                return 6;
            } else if (this.level >= 40) {
                return 5;
            } else if (this.level >= 35) {
                return 4;
            } else if (this.level >= 30) {
                return 3;
            } else if (this.level >= 25) {
                return 2;
            } else if (this.level >= 20) {
                return 1;
            } else {
                return 0;
            }
        },
        percentage() {
            return type => {
                if (this.exploration[type]) {
                    return this.exploration[type].exploration_percentage / 10 + "%";
                }
            }
        },
        expLevel() {
            return type => {
                if (this.exploration[type]) {
                    return "Lv." + this.exploration[type].level;
                }
            }
        }
    }
};

const AvatarElement = {
    template: '#avatar-element',
    props: {
        avatar: {
            type: Object,
            default() {
                return {
                    fetter: 0,
                    level: 0,
                    image: "",
                    name: ""
                }
            }
        }
    }
}

const middle = {
    template: '#middle',
    props: {
        avatars: {
            type: Array
        }
    },
    components: {
        AvatarElement
    }
};

const bottom = {
    template: '#bottom'
};

const HomeMap = {
    template: '#home-map',
    props: {
        data: {
            type: Object,
            default() {
                return {
                    comfort_level_name: '',
                    comfort_num: 0
                }
            }
        }
    },
    computed: {
        bgImg() {
            return `http://adachi-bot.oss-cn-beijing.aliyuncs.com/item/${this.data.name}.png`;
        }
    }
};

const home = {
    template: '#home',
    data() {
        return {
            island: {},
            hole: {},
            mountain: {}
        }
    },
    props: {
        maps: Object
    },
    components: {
        HomeMap
    },
    methods: {
        findMap(type) {
            let info = this.maps.find(el => el.name === type);
            return info ? info : { name: type, level: -1 };
        }
    },
    watch: {
        maps() {
            this.hole = this.findMap('罗浮洞');
            this.mountain = this.findMap('翠黛峰');
            this.island = this.findMap('清琼岛');
        }
    }
};