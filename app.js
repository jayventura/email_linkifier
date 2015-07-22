(function(){

// Create new FileReader object and add submit button event
var reader = new FileReader();
document.getElementById("submit").addEventListener("click", function(event) {
	event.preventDefault();

	if (formValidation()) {
		var file = document.getElementById("fileupload").files[0];
	    reader.readAsText(file, "UTF-8");
	    reader.onload = function (evt) {
	        document.getElementById("outputcontent").value = linkify(evt.target.result);
	    }
	    reader.onerror = function (evt) {
	        document.getElementById("outputcontent").value = "error reading file";
	    }
    }

});

// Validate form (current only need to make sure campaignid exists)
function formValidation() {
	if (document.getElementById("campaignid").value) {
		return true;
	} else {
		document.getElementById("campaignid").focus();
		alert("Please enter a valid campaign ID.");
	}
}

// core Linkify function
function linkify(result) {
	// Parse string to HTML DOM nodes
	var parser = new DOMParser();
	var htmldom = parser.parseFromString(result, "text/html");

	// VARIABLES
	var campaign = document.getElementById("campaignid").value;
	var coupon = document.getElementById("couponcode").value;
	var affiliateRedirect = document.getElementById("affiliatelink").value;
	var encodehtml = document.getElementById("encodecheck").checked;
	var checkAffiliate;
	if (affiliateRedirect) {
		if (affiliateRedirect.match(/linksynergy/)) {
			checkAffiliate = "linkshare";
		} else if (affiliateRedirect.match(/tradetracker/)) {
			checkAffiliate = "tradetracker";
		} // need to verify URL pattern
	}

	// Step 1: Get array of links from HTML
	var getLinks = htmldom.getElementsByTagName("a");
	var linkArray = [].slice.call(getLinks, 0);

	// Step 2: Modify href
	var hrefStringsArray = [];

		// Step 2a: Get href by convert to string, validate, and push to array
		var hrefValidation = function() {
			for (var i=0, ii=linkArray.length; i<ii; i++) {
				var hrefString = String(linkArray[i]);
				if (hrefString.indexOf("http") > -1) {
					hrefStringsArray.push(hrefString);
				} else {
					delete linkArray[i];
				}
			}
		}();

		// Step 2b: Add parameters, encode, replace in array
		var hrefModification = function() {
			for (var i=0, ii=hrefStringsArray.length; i<ii; i++) {
				// parameters need to be added with ?'s because linkshare doesn't read the &
				var parameter = "?yie_campaign=" + campaign;
				if (coupon) {
					parameter += "?yie_coupon=" + coupon;
				}

				var newhref;
				if (encodehtml === true) {
					newhref = affiliateRedirect + encodeURIComponent(hrefStringsArray[i] + parameter);
				} else if (encodehtml === false) {
					newhref = affiliateRedirect + hrefStringsArray[i] + parameter;
				}
				
				hrefStringsArray[i] = newhref;
			}
		}();

	// Step 3: Modify HTML
	var htmlModification = function() {
		for (var i=0, ii=getLinks.length; i<ii; i++) {
			// skip if href has been filtered out in validation process (e.g. it's mail:to)
			if (hrefStringsArray[i] === undefined) {
				continue;
			}

			getLinks[i].setAttribute("href", hrefStringsArray[i]);
		}
	}();

	// Grab DOCTYPE node and convert to string
	var doctypenode = document.doctype;
	var doctypehtml = "<!DOCTYPE "
         + doctypenode.name
         + (doctypenode.publicId ? ' PUBLIC "' + doctypenode.publicId + '"' : '')
         + (!doctypenode.publicId && doctypenode.systemId ? ' SYSTEM' : '') 
         + (doctypenode.systemId ? ' "' + doctypenode.systemId + '"' : '')
         + '>';

    // Return final string
	return doctypehtml + htmldom.documentElement.outerHTML;

}

})();

