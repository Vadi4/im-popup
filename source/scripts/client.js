// event on links
let afterLoad = () => {
	console.log('afterLoad');
}

// event on popup
let afterLoadPopup = () => {
	console.log('afterLoadPopup');
}

// base function on open popup
let popupLoad = ($popup) => {
	console.log($popup);
}

// base function on close popup
let popupClose = ($popup) => {
	console.log($popup);
}

document.addEventListener('popup.open', e => {
	
	console.log('initiator on open', e.detail.initiator);

});

document.addEventListener('popup.close', e => {
	
	console.log('target on close', e.detail.target);

});