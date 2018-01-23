import { cunit } from '../../services/parsers';

export const ParsedKey = {
	EMA: [{name:"EMA", parse:parseFloat}],
	SMA: [{name:"SMA", parse:parseFloat}],
	STOCH: [{name:"SlowK", parse:parseFloat}, {name:"SlowD", parse:parseFloat}],
	RSI: [{name:"RSI", parse:parseFloat}],
	ADX: [{name:"ADX", parse:parseFloat}],
	CCI: [{name:"CCI", parse:parseFloat}],
	BBANDS: [{name:"Real Middle Band", parse:parseFloat},
			 {name:"Real Upper Band", parse:parseFloat},
			 {name:"Real Lower Band", parse:parseFloat}],
	MACD: [{name:"MACD_Signal", parse:parseFloat},
		   {name:"MACD", parse:parseFloat},
		   {name:"MACD_Hist", parse:parseFloat}]
}

export function shortInd(ind: string){
	if(ind.indexOf(':') < 0) {
		return ind;
	}
	return ind.substring(ind.indexOf(':')+2);
}

export function processSeries(dates, series, keys) : {} {
		var res = {};
		keys.forEach((key) => {
			res[key.name] = {
				vals:[],
				min: Number.MAX_VALUE,
				max: Number.MIN_VALUE,
			};
		});
		res['min'] = res[keys[0].name].min;
		res['max'] = res[keys[0].name].max;
		for(let i = dates.length-1; i >=0; i--){
			let utc = (new Date(dates[i])).getTime();
			keys.forEach((key) => {
				let val = series[dates[i]][key.name];
				if(key.parse == parseFloat) {
					val = cunit(val);
				}
				res[key.name].vals.push([utc, val]);
				res[key.name].min = Math.min(val, res[key.name].min);
				res[key.name].max = Math.max(val, res[key.name].max);
				res['min'] = Math.min(res['min'], res[key.name].min);
				res['max'] = Math.max(res['max'], res[key.name].max);
			});
		}
		return res;
}

export function getTickDate(dates) : Array<any> {
		var tickpos = [(new Date(dates[0])).getTime()];
		var cur = tickpos[0];
		for(let i = 0; i < dates.length; i++){
			let utc = (new Date(dates[i])).getTime();
			if(cur - utc >= 7 * 24 * 3600 * 1000){
				tickpos.unshift(utc);
				cur = utc;
			}
		}
		return tickpos;
}