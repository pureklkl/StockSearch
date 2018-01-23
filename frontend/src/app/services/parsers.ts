
export function cunit(val: number){
	return val / 10000.0;
}

function parseStock(stock) {
	if(stock["Meta Data"] != null){
		let symbol = stock["Meta Data"]["Symbol"];
		let date = stock["Meta Data"]["Last Refreshed"];
		let info = stock[date];
		let stInfo = {};
		stInfo['Symbol'] = symbol;
		stInfo['Price'] = cunit(info["adjusted close"]);
		stInfo['Change'] = stInfo['Price'] - cunit(info["open"]);
		stInfo['Change Percent'] = stInfo['Change'] / cunit(info["open"]);
		stInfo['Volume'] = info["volume"];
		stInfo['VolumeStr'] = info["volume"].toLocaleString("en", {useGrouping:true});
		return stInfo;
	} else {
		return null;
	}
}

export function sortStock(data) {
	let ind = "";
	for (let key in data) {
		if(key != "Error Message" && key != "Meta Data") {
			ind = key;
		}
	}
	if(ind != "") {
		data['ind'] = ind;
		data['dates'] = [];
		for(let key in data[ind]){ 
			data['dates'].push(key);
		}
		data['dates'].sort((d1, d2) => {
			return (new Date(d2)).getTime() - (new Date(d1)).getTime();
		});
	} else if(data["Error Message"] == null){
		data["Error Message"] = "empty object error";
	}
	return data;
}

export function parseFavor(value){
	let favArray = [];
	for(let stock of value){
		let parsed = parseStock(stock);
		if(parsed != null) {
			favArray.push(parsed);
		} else {
			return null;
		}
	}
	return favArray;
}

export class Stock {
	ind: string
}
export class FavorStock {
	addTime: number;
	Symbol: string;
	Price: number;
	Change: number;
	'Change Percent': number;
	Volume: number;
	VolumeStr: string;
}

export const DATA_PATH = {
	USER_FAVOR: ['user', 'userInfo', 'favors'],
}

export function queryData(json: {}, dataPath: Array<string>) {
	for(let key of dataPath) {
		json = json[key];
	}
	return json;
}