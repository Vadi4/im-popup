// CURRENT IMPOPUP VERSION 2.2.9


// OPTIONS AND SETTINGS

/**
 * 
*  FOR .IM-POPUPS
* @data-single-active="true" active is only one popup
* 
* FOR .IM-POPUP-LINK 
* @href - path for calling fetch,
* @data-href - second path for calling fetch,
* if href starts with # it's means open static popup #id - where id popup
* @data-after_load="fName" - attribute is a name of calling function
* @data-close-other="true" - close other opened popups
* 
* FOR .IM-POPUP
* @data-after_load="fName" - attribute is a name of calling function  
* @data-close-popup="true" - outer click closing
* @data-close-link="true" - on click close current popup
* @data-static="true" - don't remove html of popup after closing
* 
* EVENTS
* @imPopup.open('popup') - open with id
* @imPopup.dynamicHTML('some/path', dataset) - open with path, dataset is not necessary
* @imPopup.close('popup') - close with id
* @imPopup.close('') - close any open popup
* BASE FUNCTIONS
* @popupLoad = ($popup) => {}
* @popupClose = ($popup) => {}
 */


// END OPTIONS AND SETTINGS

// AFTER LOAD
let _afterLoad = (functions, $target) => {
	if(functions && window[functions])
	return window[functions]($target);
}
// END AFTER LOAD

const isInited = window.imPopup ? true : false; // если уже попап инициализирован

let imPopup = null;



imPopup = (options) => {

	if( isInited ) return;

	const ANIMATION_SPEED = 250;
	let closing = false;
	let opening = false;
	let dynamic = false;
	let st_open = false;
	let hasHashId = false;
	let $target, href, st_static, afterLoad;

	document.addEventListener('click', e => {
		$target = e.target;

		if( $target.closest('.im-popup-link') ) {
			dynamic = false;

			const $LINK = $target.closest('.im-popup-link'); 
			href = $LINK.getAttribute('href') ? $LINK.getAttribute('href') : '';
			if( !href ) href = $LINK.getAttribute('data-href') ? $LINK.getAttribute('data-href') : '';
			afterLoad = $LINK.getAttribute('data-after_load');

			if( !st_open ) {
				// OPENING EVENTS
				e.preventDefault();
				hasHashId = (href[0] == '#') ? true : false;
				const linkId = hasHashId ? href.substr(1) : $target.closest('.im-popup-link').getAttribute('data-id');
				imPopup.open( linkId );
			}

		}

		// CHECK FOR OPEN STATE
		if( document.querySelector('.im-popups') && document.querySelector('.im-popups').getAttribute('data-single-active') ) {
			st_open = document.querySelectorAll('.im-popup._visible').length;
		}

		// CLOSING EVENTS
		if ( $target.closest('.b-popup__close') || $target.closest('[data-close-link]') || $target.getAttribute('data-close-popup') ) {

			e.preventDefault();
			imPopup.close( $target.closest('.im-popup').getAttribute('id') );

		}

	});


	const imPopup = {
		open(id) {
			if(!closing && !opening){

				let $popup = document.querySelector('#'+id+'');
				
				let offset = window.innerWidth - document.documentElement.clientWidth;
				document.body.style.overflow = 'hidden';
				document.body.style.paddingRight = offset+'px';
				opening = true;

				if( href && !hasHashId ) {

					imPopup.dynamicHTML(href);

				} else {

					if( !$popup ) {
						document.body.style.overflow = '';
						document.body.style.paddingRight = '';
						opening = false;
						return console.error('popup with current id is undefined') 
					}


					if( $target && $target.closest('.im-popup-link') ) {
						if($target.closest('.im-popup-link').getAttribute('data-close-other') ) {
							document.querySelectorAll('.im-popup._visible').forEach( popup => {
								imPopup.close( popup.getAttribute('id') );
							});
						};	
					}
		

					_afterLoad(afterLoad, $target);

					try {
						$popup.classList.add('_visible');
					} catch(error) {
						console.error(error);
					}

					opening = false;

					const $initiatorLink = ($target && $target.closest('.im-popup-link')) ? $target.closest('.im-popup-link') : null;

					$popup.dispatchEvent(new CustomEvent('popup.open', {
						bubbles: true,
						cancelable: true,
						view: window,
						detail: {initiator: $initiatorLink}
					}));


					if( $popup.getAttribute('data-after_load') ) {
						_afterLoad($popup.getAttribute('data-after_load'), $target);
					}


					if( typeof popupLoad == 'function'){
						return popupLoad($popup);
					}

				}

			}	
		},
		close(id) {

			let $popup;

			if( id ) {
				$popup = document.querySelector('#'+id+'');
			} else {
				$popup = document.querySelector('.im-popup._visible');
			}

			if ( !$popup ) return;


			closing = true;
			

			setTimeout(() => {
				document.body.style.overflow = '';
				document.body.style.paddingRight = '';
				if( !$popup.getAttribute('data-static') ) {
					$popup.remove();
				}
			}, ANIMATION_SPEED);

			$popup.classList.remove('_visible');

			if(!dynamic) imPopup._clearFormErrors($popup);

			closing = false;

				$popup.dispatchEvent(new CustomEvent('popup.close', {
					bubbles: true,
					cancelable: true,
					view: window,
					detail: {target: $popup}
				}));

			if( typeof popupClose == 'function'){
				return popupClose($popup);
			}

		},
		dynamicHTML(_href, dataset) {

			let popupId = 'popup'+Date.now();
			let formData = new FormData();

			if( $target && $target.closest('.im-popup-link') ) {
				if(!dataset) dataset = $target.closest('.im-popup-link').dataset;
			}


			if(dataset){
				for (const field of Object.keys(dataset)) {
					if (field) {
						formData.append(field, dataset[field]);
					}
				}
			}

			let headers = {"X-Requested-With":"XMLHttpRequest"};
			if( document.querySelector('meta[name="csrf-token"]') ) {
				headers['X-CSRF-Token'] = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
			}


			// FOR LOCAL DEBUG
			
			// fetch(
			// 	'/response.json',
			// 	{
			// 		method: 'GET',
			// 	}

			fetch(
				_href,
				{
					method: 'POST',
					body: formData,
					headers: headers
				}
			).then(
				response => response.json()
			).then( 
				response => {
					if(response.result) {
						
						if(response.message){
							let popup = document.createElement('div');

							if( typeof insertHTML == 'function' ) {
								insertHTML(response.message.trim(), popup)
							} else { 
								popup.innerHTML = response.message.trim();
							}

							popup.firstChild.setAttribute('id', popupId);

							if( !document.querySelector('.im-popups') ) {
								
								let imPopupWrap = document.createElement('div');
								imPopupWrap.classList.add('im-popups');
								document.body.insertAdjacentElement('beforeend', imPopupWrap);
								// document.body.after(imPopupWrap);

							}

							document.querySelector('.im-popups').appendChild(popup.firstChild);
	
							href = false;
							opening = false;
							dynamic = true;

							return imPopup.open(popupId);
						}

					} else {
						opening = false;
						alertError.show(response.message);
					}
				}
			).catch((error) => {
				opening = false;
				console.error(error);

			});


		},
		_clearFormErrors($popup) {

			let errs = $popup.querySelectorAll('._err');
			errs.forEach(function (item, i) {
				item.innerHTML = "";
			});
			
			let err_fields = $popup.querySelectorAll('.error');
			err_fields.forEach(function (item, i) {
				item.classList.remove('error');
			});

			if($popup.querySelector('._message')){
				$popup.querySelector('._message').innerHTML = '';
			}
		}	
	}	

	return imPopup;

}

imPopup = imPopup();
window.imPopup = imPopup; // form global 