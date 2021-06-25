// /src/plugins/tools/dice.ts
// 2021 He Yang @kernel.bin <1160386205@qq.com>

import { CommonMessageEventData as Message } from "oicq";

const DEFAULT_TIMES = 1;
const DEFAULT_MAXNUM = 6;

const MAX_TIMES = 100;
const MAX_MAXNUM = 32767;

enum OptionType {
    TIMES,
    MAXNUM,
    UNKNOWN
}

function replyTooMuchOption( strings, option: string, maxtime: number ) {
    return `你不能指定选项 ${ option } 超过 ${ maxtime } 次`;
}

function replyMissingParamAfter( strings, option: string ) {
    return `选项 ${ option } 后缺少参数`;
}

function replyInputRightNumber() {
    return `请输入正确的数字`;
}

function replyUnknownOption( strings, option: string ) {
    return `未知的选项 ${ option }`;
}

function replyTimesTooBig() {
    return `掷骰子的次数不应超过 ${ MAX_TIMES }`;
}

function replyMaxNumTooBig() {
    return `骰子面数不应超过 ${ MAX_MAXNUM }`;
}


function getRandomInt( maxNumber: number ): number {
    return Math.floor( Math.random() * maxNumber ) + 1;
}

function getOptionType( option: string ): OptionType {
    if ( option.toLowerCase() === "-t" ) {
        return OptionType.TIMES;
    }
    if ( option.toLowerCase() === "-m" ) {
        return OptionType.MAXNUM;
    }
    return OptionType.UNKNOWN;
}

function getPositiveInteger( strNumber: string ): number {
    const num = Number( strNumber );
    if ( Number.isInteger( num ) ) {
        if ( num > 0 ) {
            return num;
        }
    }
    return NaN;
}

async function main( sendMessage: ( content: string ) => any, message: Message ): Promise<void> {
    let times = DEFAULT_TIMES, maxnum = DEFAULT_MAXNUM;
    let hasTimes = false, hasMaxnum = false;
    const args = message.raw_message.split( " " ).filter( function ( i ) {
        return i;
    } );
    for ( let index = 0; index < args.length; index++ ) {
        if ( getOptionType( args[index] ) == OptionType.TIMES ) {
            if ( hasTimes ) {
                await sendMessage( replyTooMuchOption`${ args[index] }${ 1 }` );
                return;
            } else {
                hasTimes = true;
                if ( index + 1 >= args.length ) {
                    await sendMessage( replyMissingParamAfter`${ args[index] }` );
                    return;
                }
                index++;
                times = getPositiveInteger( args[index] );
                if ( Number.isNaN( times ) ) {
                    await sendMessage( replyInputRightNumber() );
                    return;
                }
                if ( times > MAX_TIMES ) {
                    await sendMessage( replyTimesTooBig() );
                    return;
                }
            }
        } else if ( getOptionType( args[index] ) == OptionType.MAXNUM ) {
            if ( hasMaxnum ) {
                await sendMessage( replyTooMuchOption`${ args[index] }${ 1 }` );
                return;
            } else {
                hasMaxnum = true;
                if ( index + 1 >= args.length ) {
                    await sendMessage( replyMissingParamAfter`${ args[index] }` );
                    return;
                }
                index++;
                maxnum = getPositiveInteger( args[index] );
                if ( Number.isNaN( maxnum ) ) {
                    await sendMessage( replyInputRightNumber() );
                    return;
                }
                if ( maxnum > MAX_MAXNUM ) {
                    await sendMessage( replyMaxNumTooBig() );
                    return;
                }
            }
        } else {
            await sendMessage( replyUnknownOption`${ args[index] }` );
            return;
        }
    }
    
    let result = times + ' 次掷骰子的结果如下: ';
    for ( let i = 1; i <= times; i++ ) {
        result += getRandomInt( maxnum ) + ' ';
    }
    await sendMessage( result );
    return;
}

export { main }