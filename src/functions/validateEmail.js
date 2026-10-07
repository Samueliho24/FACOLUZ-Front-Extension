export default function validateEmail(e){
		const regex = new RegExp(/^[a-zA-Z0-9\.\-\_+]*@(?:gmail|hotmail).com$/);
		const res = regex.test(e);
		if(res == true){
			return true;
		}else{
			return false;
		}
	}