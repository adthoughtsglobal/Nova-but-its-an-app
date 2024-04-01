var batteryLevel, winds = {}, rp, flwint = true, opentrigger, memory, nowapp, stx = gid("startuptx"), applogs = {}, fulsapp = false, nowappdo, appsHistory = [];

// Check if the database 'trojencat' exists
getdb('trojencat', 'rom')
	.then(async (result) => {
		try {
			if (result !== null) {
				memory = result;
				let folders = await getFolderNames();
				if (!folders.includes("Desktop")) {
					createFolder("Desktop")
				}
			} else {
				await say(`<h2>Terms of service and License</h2><p>By using Nova OS, you agree to the <a href="https://github.com/adthoughtsglobal/Nova-OS/blob/main/Adthoughtsglobal%20Nova%20Terms%20of%20use">Adthoughtsglobal Nova Terms of Use</a>.`);

				gid("startup").showModal();
				stx.innerHTML = "Preparing memory"
				// If the 'rom' key doesn't exist, assign a random array to the 'memory' list
				memory = [
					// array with all folders
					{
						// folder
						"folderName": "Downloads",
						"content": [
							{
								"fileName": "Welcome",
								"uid": "sibq81",
								"type": "txt",
								"content": "Welcome to Nova OS! Thank you for using this OS, we believe that we have made this 'software' as the most efficient for your daily usage. If not, kindly reach us https://adthoughtsglobal.github.io and connect via the available options, we will respond you back! Enjoy!"
							},
							{
								"fileName": "Basic Help",
								"uid": "y67njs",
								"type": "txt",
								"content": "Please visit the Nova wiki page on GitHub to learn how to use Nova if you seem to struggle using it. You can find it at: https://github.com/adthoughtsglobal/Nova-OS/wiki/"
							}
						]
					},
					{
						"folderName": "Apps",
						"content": []
					},
					{
						"folderName": "Desktop",
						"content": []
					}
				];

				// Save the default array to the 'rom' key in the 'trojencat' database
				setdb('trojencat', 'rom', memory);
				initialiseOS()

			}
			async function fetchDataAndUpdate() {
				let localupdatedataver = localStorage.getItem("updver");
				let fetchupdatedata = await fetch("versions.json");

				if (fetchupdatedata.ok) {
					let fetchupdatedataver = (await fetchupdatedata.json()).osver;

					if (localupdatedataver !== fetchupdatedataver) {
						if (await justConfirm("Update default apps?", "Your default apps are old. Update them to access new features and fixes.", 1)) {
							await installdefaultapps();
						} else {
							say("You can always update app on settings app/Preferances")
						}
					}
				} else {
					console.error("Failed to fetch data from the server.");
				}
			}

			fetchDataAndUpdate();
		} catch (error) {
			console.error('Error in database operations:', error);
		}
	})
	.catch((error) => {
		console.error('Error retrieving data from the database:', error);
	});



function updateTime() {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, '0');
	const minutes = now.getMinutes().toString().padStart(2, '0');
	const seconds = now.getSeconds().toString().padStart(2, '0');

	const timeString = `${hours}:${minutes}:${seconds}`;
	gid('time-display').innerText = timeString;

	const year = now.getFullYear();
	const month = (now.getMonth() + 1).toString().padStart(2, '0');
	const day = now.getDate().toString().padStart(2, '0');

	const dateString = `${day}-${month}-${year}`;
	gid('date-display').innerText = dateString;

}
updateTime();
setInterval(updateTime, 1000);
checkdmode()

async function openn() {
	gid("appsindeck").innerHTML = ""
	gid("strtsear").value = ""
	let x = await getFileNamesByFolder("Apps");
	x.forEach(async function(app) {
		// Create a div element for the app shortcut
		var appShortcutDiv = document.createElement("div");
		appShortcutDiv.className = "app-shortcut tooltip";
		appShortcutDiv.setAttribute("onclick", "openapp('" + app.name + "', '" + app.id + "')");

		// Create a span element for the app icon
		var iconSpan = document.createElement("span");

		// Fetch the content asynchronously using getFileById
		const content = await getFileById(app.id);

		// Unshrink the content
		const unshrunkContent = unshrinkbsf(content.content);

		// Create a temporary div to parse the content
		const tempElement = document.createElement('div');
		tempElement.innerHTML = unshrunkContent;

		// Get all meta tags
		const metaTags = tempElement.getElementsByTagName('meta');

		// Create an object to store meta tag data
		let metaTagData = null;

		// Iterate through meta tags and extract data
		Array.from(metaTags).forEach(tag => {
			const tagName = tag.getAttribute('name');
			const tagContent = tag.getAttribute('content');
			if (tagName === 'nova-icon' && tagContent) {
				metaTagData = tagContent;
			}
		});

		if (typeof metaTagData === "string") {
			if (containsSmallSVGElement(metaTagData)) {
				iconSpan.innerHTML = metaTagData;
			} else {

				iconSpan.innerHTML = `<span class="app-icon">` + makedefic(app.name) + `</span>`;
			}
		} else {
			iconSpan.innerHTML = `<span class="app-icon">` + makedefic(app.name) + `</span>`;
		}



		// Create a span element for the app name
		var nameSpan = document.createElement("span");
		nameSpan.className = "appname";
		nameSpan.textContent = app.name;

		var tooltisp = document.createElement("span");
			tooltisp.className = "tooltiptext";
			tooltisp.textContent = app.name;

		// Append both spans to the app shortcut container
		appShortcutDiv.appendChild(iconSpan);
		appShortcutDiv.appendChild(nameSpan);
		appShortcutDiv.appendChild(tooltisp);

		gid("appsindeck").appendChild(appShortcutDiv);
	})
	gid('appdmod').showModal()
}

function makedefic(str) {
	const vowelPattern = /[aeiouAEIOU\s]+/g;
	const consonantPattern = /[^aeiouAEIOU\s]+/g;

	const vowelMatches = str.match(vowelPattern);
	const consonantMatches = str.match(consonantPattern);

	if (consonantMatches && consonantMatches.length >= 2) {
		const firstTwoConsonants = consonantMatches.slice(0, 2);
		const capitalized = firstTwoConsonants.map((letter, index) => index === 0 ? letter.toUpperCase() : letter.toLowerCase());
		const result = capitalized.join('');
		return result.length > 2 ? result.slice(0, 2) : result;
	} else {
		const firstLetter = str.charAt(0).toUpperCase();
		const firstConsonantIndex = str.search(consonantPattern);
		if (firstConsonantIndex !== -1) {
			const firstConsonant = str.charAt(firstConsonantIndex).toLowerCase();
			const result = firstLetter + firstConsonant;
			return result.length > 2 ? result.slice(0, 2) : result;
		} else {
			return firstLetter;
		}
	}
}


function updateBattery() {
	navigator.getBattery().then(function(battery) {
		// Get the battery level
		batteryLevel = Math.floor(battery.level * 100);

		// Determine the appropriate icon based on battery level
		let iconClass;
		if (batteryLevel >= 75) {
			iconClass = 'battery_full';
		} else if (batteryLevel >= 25) {
			iconClass = 'battery_5_bar';
		} else if (batteryLevel >= 15) {
			iconClass = 'battery_2_bar';
		} else {
			iconClass = 'battery_alert';
		}

		// Check if the value has changed
		if (iconClass !== gid('battery-display').innerText) {
			// Update the display only if the value changes
			gid('battery-display').innerHTML = iconClass;
			gid('battery-p-display').innerHTML = batteryLevel + "%";
		}
	});
}
updateBattery();

navigator.getBattery().then(function(battery) {
	battery.addEventListener('levelchange', updateBattery);
});

function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	if (gid(elmnt.id + "header")) {
		// if present, the header is where you move the DIV from:
		gid(elmnt.id + "header").onmousedown = dragMouseDown;
	} else {
		// otherwise, move the DIV from anywhere inside the DIV:
		elmnt.onmousedown = dragMouseDown;
	}

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		e.preventDefault();
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}



dod()
async function dod() {
	setTimeout(async function() {
		gid("desktop").innerHTML = ``;
		let y = await getFileNamesByFolder("Desktop")
		y.forEach(async function(app) {
			// Create a div element for the app shortcut
			var appShortcutDiv = document.createElement("div");
			appShortcutDiv.className = "app-shortcut";
			appShortcutDiv.setAttribute("onclick", "openfile(this)");
			appShortcutDiv.setAttribute("unid", app.id);


			// Create a span element for the app icon
			var iconSpan = document.createElement("span");

			// Fetch the content asynchronously using getFileById
			const content = await getFileById(app.id);

			// Unshrink the content
			const unshrunkContent = unshrinkbsf(content.content);

			// Create a temporary div to parse the content
			const tempElement = document.createElement('div');
			tempElement.innerHTML = unshrunkContent;

			// Get all meta tags
			const metaTags = tempElement.getElementsByTagName('meta');

			// Create an object to store meta tag data
			let metaTagData = null;

			// Iterate through meta tags and extract data
			Array.from(metaTags).forEach(tag => {
				const tagName = tag.getAttribute('name');
				const tagContent = tag.getAttribute('content');
				if (tagName === 'nova-icon' && tagContent) {
					metaTagData = tagContent;
				}
			});


			if (typeof metaTagData === "string") {
				if (containsSmallSVGElement(metaTagData)) {
					iconSpan.innerHTML = metaTagData;
				} else {

					iconSpan.innerHTML = `<span class="app-icon">` + makedefic(app.name) + `</span>`;
				}
			} else {
				iconSpan.innerHTML = `<span class="app-icon">` + makedefic(app.name) + `</span>`;
			}



			// Create a span element for the app name
			var nameSpan = document.createElement("span");
			nameSpan.className = "appname";
			nameSpan.textContent = app.name;

			// Append both spans to the app shortcut container
			appShortcutDiv.appendChild(iconSpan);
			appShortcutDiv.appendChild(nameSpan);

			gid("desktop").appendChild(appShortcutDiv);
		});
		closeElementedis()
		let x = localStorage.getItem("qsets");
		x = await getFileById(JSON.parse(x).wall);

		if (x) {
			let unshrinkbsfX = unshrinkbsf(x.content);
			document.getElementById('bgimage').style.backgroundImage = `url("` + unshrinkbsfX + `")`;
		} else {
			gid("bgimage").style.backgroundImage = `url("wallpaper.png")`;
		}
	}, 1000);

}

function closeElementedis() {
	var element = document.getElementById("edison");
	element.classList.add("closeEffect");
	setTimeout(function() {
		element.close()
	}, 400);
}


function clwin(x) {
	x.parentElement.parentElement.classList.add("transp3")

	setTimeout(() => {
		x.parentElement.parentElement.classList.remove("transp3")
		x.parentElement.parentElement.remove();
	}, 700);
}

function flwin(x) {
	x.parentElement.parentElement.classList.add("transp2")
	if (x.innerHTML == "web_asset") {
		x.parentElement.parentElement.style = "left: 0;top: 0;width: calc(100% - 0px);height: calc(100% - 57px);";
		x.innerHTML = "filter_none";
		fulsapp = true;
	} else {

		x.parentElement.parentElement.style = "left: calc(50vw - 200px);top: calc(50vh - 135px); width: 381px; height: 227px;"
		nowapp = ""
		dewallblur();
		x.innerHTML = "web_asset"
		fulsapp = false;
	}
	checktaskbar()
	setTimeout(() => {
		x.parentElement.parentElement.classList.remove("transp2")

	}, 1000);


}

async function openapp(x, od) {
	
	dod()
	if (gid('appdmod').open) {
		gid('appdmod').close()
	}


	// opening an app
	const fetchDataAndSave = async (x) => {
		try {


			var y;
			if (od != 1) {
				y = await getFileById(od)
				y = unshrinkbsf(y.content)
			} else {
				y = await fetchData("appdata/" + x + ".html");
				let m = await getFileNamesByFolder("Apps");
				await createFile("Apps", x, "app", y);
			}

			// Assuming you have a predefined function openwindow
			openwindow(x, y);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	// Call fetchDataAndSave with the desired value of x
	fetchDataAndSave(x);
}

async function fetchData(url) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.text();
		return data;
	} catch (error) {
		console.error("Error fetching data:", error.message);
		const data = "App Launcher: CRITICAL ERROR<br><br><sup>" + error.message + "</sup>";
		return data;
	}
}
var content
function openwindow(title, cont) {
	content = cont
	if (content == undefined) {
		content = "<center><h1>Unavailable</h1>App Data cannot be read.</center>";
	}

	let winuid = genUID();
	winds[title + winuid] = 1;

	// Create the window element
	var windowDiv = document.createElement("div");
	windowDiv.id = "window" + winuid;
	windowDiv.onclick = function() {
		nowapp = title;
		dewallblur();
	}
	nowapp = title;
	dewallblur();
	windowDiv.classList += "window";

	let isitmob = window.innerWidth <= 500;

	// Set the style of windowDiv
	if (isitmob) {
		windowDiv.style.left = 0;
		windowDiv.style.top = 0;
	}
	if (!isitmob) {
		windowDiv.style = 'left: calc(-225px + 50vw);top: calc(-150px + 50vh);width: 450px;height: 300px;z-index: 0;';
	} else {
		windowDiv.style.width = 'calc(100% - 5px)';
		windowDiv.style.height = 'calc(100% - 63px)';
	}

	// Create the window header
	var windowHeader = document.createElement("div");
	windowHeader.id = "window" + winuid + "header"
	windowHeader.classList += "windowheader";
	windowHeader.textContent = toTitleCase(title);
	windowHeader.setAttribute("title", title + winuid)
	windowHeader.addEventListener("mouseup", function(event) {
		checksnapping(windowDiv, event);
	});

	windowHeader.addEventListener("mousedown", function(event) {
		putwinontop('window' + winuid);
		winds[title + winuid] = windowDiv.style.zIndex;
		
	});
	
	var flButton = document.createElement("span");
	flButton.classList.add("material-icons", "wincl", "flbtn");
	flButton.style = "right: 20px;font-size: 10px !important;padding: 3px;";
	flButton.textContent = "web_asset";
	flButton.onclick = function() {
		flwin(flButton);
	};

	// Create the close button in the header
	var closeButton = document.createElement("span");
	closeButton.classList.add("material-icons", "wincl");
	closeButton.textContent = "close";
	closeButton.onclick = function() {
		setTimeout(function() {
			nowapp = '';
			dewallblur();
		}, 500);
		clwin(closeButton, title);
		delete winds[title + winuid];
	};

	// Append the close button to the header
	windowHeader.appendChild(closeButton);
	if (!isitmob) { windowHeader.appendChild(flButton); }

	var windowContent = document.createElement("div");
	windowContent.classList += "windowcontent";

	var iframe = document.createElement("iframe");

	windowContent.appendChild(iframe);

	// Attach onload event handler to iframe
	iframe.onload = function() {
		// Check if content includes script tags
		if (content.includes("<script")) {
			// Extract script tags from content
			var scriptTags = content.match(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi);

			// Loop through each script tag
			scriptTags.forEach(function(scriptTag) {
				var script = iframe.contentDocument.createElement('script');

				// Check if the script tag has a src attribute
				var srcMatch = scriptTag.match(/src="([^"]+)"/);
				if (srcMatch) {
					// If src attribute exists, set src attribute of script element
					var src = srcMatch[1];
					console.log("src : " + src)

					// Fetch the script content
					fetch(src)
					.then(response => response.text())
					.then(scriptContent => {

						// Set the script content
						script.innerHTML = scriptContent
						script.onload = function() {
							// Execute greenflag function after script is loaded
							iframe.contentWindow.greenflag().catch(error => {
										console.error('Error loading script:', error);
									});
						};
						
					})
					.catch(error => {
						console.error('Error loading script:', error);
					});
				} else {
					// If src attribute doesn't exist, extract script content and set innerHTML of script element
					var scriptContent = scriptTag.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/i, "$1");
					script.innerHTML = scriptContent;
					// Attach onload event listener to handle script loading completion
					
				}

				// Append script element to iframe's head
				iframe.contentDocument.head.appendChild(script);
				nowappdo = iframe.contentDocument
			});
		}

		// Remove script tags from content
		var contentWithoutScripts = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

		// Set the innerHTML of iframe's body with content without scripts
		iframe.contentDocument.body.innerHTML = contentWithoutScripts;

		// Call greenflag function in iframe's window context
		iframe.contentWindow.greenflag();
	};



	// Append the header and content to the window
	windowDiv.appendChild(windowHeader);
	windowDiv.appendChild(windowContent);

	// Append the window to the document body
	document.body.appendChild(windowDiv);
	dragElement(windowDiv);
	putwinontop('window' + winuid);
}

function putwinontop(x) {
	if (Object.keys(winds).length > 1) {
		// Convert the values of winds into an array of numbers
		const windValues = Object.values(winds).map(Number);

		// Calculate the maximum value from the array
		const maxWindValue = Math.max(...windValues);

		// Set the zIndex
		document.getElementById(x).style.zIndex = maxWindValue + 1;

		// Output the values for debugging
		console.log("from: " + maxWindValue + " to: " + (maxWindValue + 1));

	} else {
		document.getElementById(x).style.zIndex = 0;
	}
}

function toTitleCase(str) {
	rp = str
	return str.toLowerCase().replace(/(?:^|\s)\w/g, function(match) {
		return match.toUpperCase();
	});
}

function openlaunchprotocol(x, y) {
	x = {
		"appname": x,
		"data": y
	}
	localStorage.setItem("todo", JSON.stringify(x))
	openapp(x.appname, 1)
}

function getMaxZIndex() {
	// Get the maximum z-index of all elements
	const elements = document.querySelectorAll('.window');
	let maxZIndex = 0;

	elements.forEach(element => {
		const zIndex = parseInt(window.getComputedStyle(element).zIndex);
		if (zIndex > maxZIndex) {
			maxZIndex = zIndex;
		}
	});
}

function genUID() {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let randomString = '';
	for (let i = 0; i < 6; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomString += characters.charAt(randomIndex);
	}
	return randomString;
}

async function createFolder(folderName) {
	try {
		memory = await getdb('trojencat', 'rom');

		// Check if the folder already exists
		const folderIndex = memory.findIndex(folder => folder.folderName === folderName);

		if (folderIndex === -1) {
			// If the folder does not exist, create it
			memory.push({
				folderName,
				content: []
			});
			console.log(`We proudly proclaim that the folder "${folderName}" created and have created a new chapter in the history of modern mankind.`);
			setdb('trojencat', 'rom', memory);
		} else {
			console.log(`Folder "${folderName}" says that im not dead! what de hail!`);
		}
	} catch (error) {
		console.error("Error creating folder:", error);
	}
}


async function createFile(folderName, fileName, type, content, metadata) {
	if (metadata === undefined) {
		metadata = { "via": "nope" };
	}
	let memory2 = await getdb('trojencat', 'rom');
	const folderIndex = memory2.findIndex(folder => folder.folderName === folderName);
	try {
		if (type === "app") {
			let appdataquacks = await getFileByPath(folderName + "/" + fileName);
			console.log("NO NO NO:", appdataquacks);
			appdataquacks = appdataquacks[0];
			console.log("Filesbepath:", fileName);
			console.log("YES YES YES:", appdataquacks);

			if (appdataquacks != null) {
				const newData = {
					metadata: metadata,
					content: content,
					fileName: fileName,
					type: type
				};
				await updateFile("Apps", appdataquacks.id, newData);
				return
			}
		}
		// Check if the folder exists
		if (folderIndex !== -1) {
			// Push the new file object to the folder's content array
			let uid = genUID();
			console.log("The preface of the constitution of the file says that it is " + metadata);
			metadata.datetime = getfourthdimension();
			metadata = JSON.stringify(metadata);

			memory2[folderIndex].content.push({
				fileName,
				uid,
				type,
				content,
				metadata
			});
			console.log(`File "${fileName}" created in folder "${folderName}".`);
			setdb('trojencat', 'rom', memory2);
		} else {
			console.log("Creating a folder anyway...");
			await createFolder(folderName);
			await createFile(folderName, fileName, type, content);
			dod();
			return;
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

async function updateFile(folderName, fileId, newData) {
	memory = await getdb('trojencat', 'rom');
	let folderIndex = memory.findIndex(folder => folder.folderName === folderName);

	try {
		if (folderIndex === -1) {
			console.log(`Folder "${folderName}" not found. Creating folder...`);
			await createFolder(folderName);
			memory = await getdb('trojencat', 'rom');
			folderIndex = memory.findIndex(folder => folder.folderName === folderName);
		}

		const fileIndex = memory[folderIndex].content.findIndex(file => file.uid === fileId);

		if (fileIndex !== -1) {
			// Update the file with the new data
			let fileToUpdate = memory[folderIndex].content[fileIndex];
			fileToUpdate.metadata = newData.metadata !== undefined ? JSON.stringify(newData.metadata) : fileToUpdate.metadata;
			fileToUpdate.content = newData.content !== undefined ? newData.content : fileToUpdate.content;
			fileToUpdate.fileName = newData.fileName !== undefined ? newData.fileName : fileToUpdate.fileName;
			fileToUpdate.type = newData.type !== undefined ? newData.type : fileToUpdate.type;

			// Update the file in memory
			memory[folderIndex].content[fileIndex] = fileToUpdate;
			setdb('trojencat', 'rom', memory);
			console.log(`File "${fileToUpdate.fileName}" updated.`);
		} else {
			console.log(`File with ID "${fileId}" not found in folder "${folderName}". Creating new file...`);
			await createFile(folderName, fileId, newData.type, newData.content, newData.metadata);
		}
	} catch (error) {
		console.error("Error updating file:", error);
	}
}

async function getFileById(x) {
	try {
		memory = await getdb('trojencat', 'rom');
		for (const folder of memory) {
			for (const item of folder.content) {
				if (item.uid === x) {
					return item;
				}
			}
		}
		return null;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}



// april fools - but its january.
function hackAllData() {
	document.body.style = "overflow:scroll;"
	// Get all elements in the document
	const allElements = document.body.querySelectorAll('*');

	// Loop through each element and replace its innerHTML
	allElements.forEach(element => {
		element.innerHTML = "N̴̔̽E̶̒̇V̴̐̚E̶̳̔R̶̛̊ ̶̓̒Ġ̴ONNA GIVE ̵̼͒Y̸͑̒Ỏ̷U UP, ͗͗N̶͂͊E̴̺̽V̸̎͘E̷R GONNA L̸͊͗Ë̵́̓T̶̃̕ ̸̌̈́Ÿ̵́̃Ȍ̴͌Ũ̴ DOWN";
	});
}

var myDialog = gid('appdmod');

document.addEventListener('click', (event) => {
	if (event.target === myDialog) {
		myDialog.close();
	}
});

async function getFileNamesByFolder(folderName) {
	try {
		memory = await getdb('trojencat', 'rom');
		const filesInFolder = [];

		for (const folder of memory) {
			if (folder.folderName === folderName) {
				for (const item of folder.content) {
					filesInFolder.push({ id: item.uid, name: item.fileName });
				}
				break;
			}
		}

		return filesInFolder;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

function justConfirm(title, message, modal) {
	return new Promise((resolve) => {
		if (!modal) {
			modal = document.createElement('dialog');
			modal.classList.add('modal');
			modal.id = "NaviconfDia";
		}

		const modalContent = document.createElement('div');
		modalContent.classList.add('modal-content');
		const bigtitle = document.createElement('h1');
		bigtitle.textContent = title;
		modalContent.appendChild(bigtitle);

		const promptMessage = document.createElement('p');
		promptMessage.innerHTML = message;
		modalContent.appendChild(promptMessage);

		let buttonContainer = modal.querySelector('.button-container');
		if (!buttonContainer) {
			buttonContainer = document.createElement('div');
			buttonContainer.classList.add('button-container');
			buttonContainer.style.display = 'flex';
			modalContent.appendChild(buttonContainer);
		} else {
			buttonContainer.innerHTML = ''; // Clear existing buttons
		}

		const yesButton = document.createElement('button');
		yesButton.textContent = 'Yes';
		yesButton.addEventListener('click', () => {
			modal.close();
			resolve(true);
		});
		buttonContainer.appendChild(yesButton);

		const noButton = document.createElement('button');
		noButton.textContent = 'No';
		noButton.addEventListener('click', () => {
			modal.close();
			resolve(false);
		});
		buttonContainer.appendChild(noButton);

		modal.appendChild(modalContent);
		if (!modal.open) {
			document.body.appendChild(modal);
		}
		modal.showModal();
	});
}


function say(message) {
	return new Promise((resolve) => {
		const modal = document.createElement('dialog');
		modal.classList.add('modal');

		const modalContent = document.createElement('div');
		modalContent.classList.add('modal-content');

		const promptMessage = document.createElement('p');
		promptMessage.innerHTML = message;
		modalContent.appendChild(promptMessage);

		const okButton = document.createElement('button');
		okButton.textContent = 'OK';
		okButton.addEventListener('click', () => {
			modal.close();
			resolve(true);
		});
		modalContent.appendChild(okButton);

		modal.appendChild(modalContent);
		document.body.appendChild(modal);

		modal.showModal();
	});
}

function ask(question, preset) {
	return new Promise((resolve) => {
		const modal = document.createElement('dialog');
		modal.classList.add('modal');

		const modalContent = document.createElement('div');
		modalContent.classList.add('modal-content');

		const promptMessage = document.createElement('p');
		promptMessage.innerHTML = question;
		modalContent.appendChild(promptMessage);

		const inputField = document.createElement('input');
		inputField.setAttribute('type', 'text');
		inputField.value = preset;
		modalContent.appendChild(inputField);

		const okButton = document.createElement('button');
		okButton.textContent = 'OK';
		okButton.addEventListener('click', () => {
			modal.close();
			resolve(inputField.value);
		});
		modalContent.appendChild(okButton);

		modal.appendChild(modalContent);
		document.body.appendChild(modal);

		modal.showModal();
	});
}

var dev;

// Compression
function shrinkbsf(str) {

	const compressed = pako.deflate(str, { to: 'string' });
	return compressed;
}

// Decompression
function unshrinkbsf(compressedStr) {
	try {
		return pako.inflate(compressedStr, { to: 'string' });
	} catch (error) {
		return compressedStr;
	}
}

async function makewall(deid) {
	console.log("dod just quacks. He then says: " + deid)
	let x = await getFileById(deid);
	x = x.content
	x = unshrinkbsf(x)
	let y = {
		"wall": deid
	}
	localStorage.setItem("qsets", JSON.stringify(y))
	document.getElementById('bgimage').style.backgroundImage = `url("` + x + `")`;
}

function reloadTaskbar() {
	let x = localStorage.getItem("sets");
	gid("dock").innerHTML = x;
}

async function remfile(ID) {
	try {
		memory = await getdb('trojencat', 'rom');

		// Iterate through folders to find the file with the specified ID
		for (let folder of memory) {
			let fileIndex = folder.content.findIndex(file => file.uid === ID);

			if (fileIndex !== -1) {
				// Remove the file from the folder's content array
				let removedFile = folder.content.splice(fileIndex, 1)[0];
				console.log(`0004`);
				await setdb('trojencat', 'rom', memory);

				// Check if the file was successfully removed
				if (!folder.content.includes(removedFile)) {
					console.log("File successfully removed.");
				} else {
					console.log("File removal failed.");
				}

				return;
			}
		}

		// If the loop completes without finding the file
		console.error(`File with ID "${ID}" not found.`);
	} catch (error) {
		console.error("Error fetching or updating data:", error);
	}
}
async function remFilesByFolder(folderName) {
	try {
		let memory2 = await getdb('trojencat', 'rom');

		// Find the folder with the specified name
		let folderIndex = memory2.findIndex(folder => folder.name === folderName);

		if (folderIndex !== -1) {
			// Remove all files in the folder
			memory2[folderIndex].content = [];
			console.log(`All files removed from folder "${folderName}".`);
		} else {
			console.error(`Folder "${folderName}" not found.`);
		}

		await setdb('trojencat', 'rom', memory2);
	} catch (error) {
		console.error("Error fetching or updating data:", error);
	}
}

var defAppsList = [
	"camera",
	"clock",
	"files",
	"media",
	"settings",
	"store",
	"text",
	"studio",
	"gallery",
	"wiki",
	"browser",
	"calculator"
];

async function initialiseOS() {
	let qsets = JSON.parse(localStorage.getItem("qsets")) || {};
	qsets.focusMode = true;
	localStorage.setItem("qsets", JSON.stringify(qsets));
	await installdefaultapps();
	let x = await getFileNamesByFolder("Apps")
	if (defAppsList.length = x.length) {
		stx.innerHTML = "Nova is updating..."
		setTimeout(installdefaultapps, 1000)
	}
}

async function installdefaultapps() {
	gid("startup").showModal();
	stx.innerHTML = "Installing System Apps (0%)";

	const maxRetries = 3;

	async function updateApp(appName, attempt = 1) {
		try {
			const filePath = "appdata/" + appName + ".html";
			const response = await fetch(filePath);
			if (!response.ok) {
				throw new Error("Failed to fetch file for " + appName);
			}
			const fileContent = await response.text();

			createFile("Apps", appName, "app", fileContent);
			console.log(appName + " updated successfully.");
		} catch (error) {
			console.error("Error updating " + appName + ":", error.message);
			if (attempt < maxRetries) {
				console.log("Retrying update for " + appName + " (attempt " + (attempt + 1) + ")");
				await updateApp(appName, attempt + 1);
			} else {
				console.error("Max retries reached for " + appName + ". Skipping update.");
			}
		}
	}

	// Update each app sequentially
	for (let i = 0; i < defAppsList.length; i++) {
		await updateApp(defAppsList[i]);
		stx.innerHTML = "Installing System Apps (" + Math.round((i + 1) / defAppsList.length * 100) + "%)";
	}
	let fetchupdatedata = await fetch("versions.json");

	if (fetchupdatedata.ok) {
		let fetchupdatedataver = (await fetchupdatedata.json()).osver;
		localStorage.setItem("updver", fetchupdatedataver);
	} else {
		console.error("Failed to fetch data from the server.");
	}

	stx.innerHTML = "Restarting...";
	// Close the element after all files are fetched and created with fade-out animation
	let modal = gid("startup");
	modal.classList.add("fade-out");
	setTimeout(() => {
		location.reload()
	}, 500);
}

async function getFileByPath(filePath) {
	try {
		// Split the filePath into folderName and fileName
		const [folderName, fileName] = filePath.split('/');

		// Fetch data from database
		var memory = await getdb('trojencat', 'rom');
		const matchingFiles = [];

		// Iterate through memory to find the specified folder
		for (const folder of memory) {
			if (folder.folderName === folderName) {
				// Iterate through content of the folder to find files with specified name
				for (const item of folder.content) {
					if (item.fileName === fileName) {
						// If found, add the file object to the array
						matchingFiles.push({ id: item.uid, name: item.fileName });
					}
				}
				// No need to break here, as there might be multiple folders with the same name
			}
		}
		// Return the array of matching files
		return matchingFiles;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

function checktaskbar() { }

function getfourthdimension() {
	const currentDate = new Date();
	return {
		year: currentDate.getFullYear(),
		month: currentDate.getMonth() + 1,
		day: currentDate.getDate(),
		hour: currentDate.getHours(),
		minute: currentDate.getMinutes(),
		second: currentDate.getSeconds()
	};
}

async function strtappse() {
	gid("strtappsugs").innerHTML = "";

	// Get the input value
	const searchValue = gid("strtsear").value.toLowerCase();
	let arrayToSearch = await getFileNamesByFolder("Apps");

	let elements = 0;

	arrayToSearch.forEach(item => {
		// Calculate similarity between item name and search value
		const similarity = calculateSimilarity(item.name.toLowerCase(), searchValue);

		// Set threshold for similarity (adjust as needed)
		const similarityThreshold = 0.5;

		if (similarity >= similarityThreshold) {
			const newElement = document.createElement("div");
			newElement.innerHTML = item.name + `<span class="material-icons" onclick="openapp('` + item.name + `', '` + item.id + `')">arrow_outward</span>`;
			gid("strtappsugs").appendChild(newElement);
			elements++;
		} else {

		}
	});
	if (elements >= 1) {
		gid("strtappsugs").style.visibility = "visible";
	} else {
		gid("strtappsugs").style.visibility = "hidden";
	}
}

function calculateSimilarity(string1, string2) {
	const m = string1.length;
	const n = string2.length;
	const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

	for (let i = 0; i <= m; i++) {
		for (let j = 0; j <= n; j++) {
			if (i === 0) dp[i][j] = j;
			else if (j === 0) dp[i][j] = i;
			else if (string1[i - 1] === string2[j - 1]) dp[i][j] = dp[i - 1][j - 1];
			else {
				const penalty = (i + j) / (m + n);
				dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1] + penalty);
			}
		}
	}

	return 1 - dp[m][n] / Math.max(m, n);
}

gid("strtsear").addEventListener("keydown", async function(event) {
	if (event.key === "Enter") {
		event.preventDefault();
		const searchValue = this.value.toLowerCase();

		let arrayToSearch = await getFileNamesByFolder("Apps");

		let maxSimilarity = 0.5;
		let appToOpen = null;

		arrayToSearch.forEach(item => {
			// Calculate similarity between item name and search value
			const similarity = calculateSimilarity(item.name.toLowerCase(), searchValue);

			// Update maxSimilarity and appToOpen if similarity is higher
			if (similarity > maxSimilarity) {
				maxSimilarity = similarity;
				appToOpen = item;
			}
		});

		// Open the app with the highest similarity (if found)
		if (appToOpen) {
			openapp(appToOpen.name, appToOpen.id)
		}
	}
});

async function getFolderNames() {
	try {
		var memory = await getdb('trojencat', 'rom');
		const folderNames = [];

		for (const folder of memory) {
			folderNames.push(folder.folderName);
		}

		return folderNames;
	} catch (error) {
		console.error("Error fetching data:", error);
		return null;
	}
}

function containsSmallSVGElement(str) {
	var svgRegex = /^<svg\s*[^>]*>[\s\S]*<\/svg>$/i;
	return svgRegex.test(str) && str.length <= 5000;
}

document.onclick = hideMenu;
document.oncontextmenu = rightClick;

function hideMenu() {
	gid(
		"contextMenu").style.display = "none"
}

function rightClick(e) {
	e.preventDefault();

	if (gid(
		"contextMenu").style.display == "block")
		hideMenu();
	else {
		var menu = document
			.getElementById("contextMenu")

		menu.style.display = 'block';
		menu.style.left = e.pageX + "px";
		menu.style.top = e.pageY + "px";
	}
}

var dash = gid("dashboard");

function dashtoggle() {

	if (dash.open) {
		dash.close();
	} else {
		dash.showModal();
	}
}

document.addEventListener('click', (event) => {
	if (event.target === dash) {
		dash.close();
	}
});


async function openfile(x, rt) {
	try {
		let unid = x.getAttribute("unid");
		if (!unid) {
			console.error("Error: 'unid' attribute not found");
			return;
		}

		let mm = await getFileById(unid);
		if (!mm) {
			console.error("Error: File not found");
			return;
		}

		let realtype = mm.type;
		if (mm.type == "app") {
			await openapp(mm.fileName, unid);
		} else if (mm.type.startsWith("image") || mm.type.startsWith("audio") || mm.type.startsWith("video")) {
			openlaunchprotocol("media", { "lclfile": unid });
		} else {
			if ((realtype == "app" || realtype.startsWith("image") || realtype.startsWith("video") || realtype.startsWith("audio")) && !rt) {

				// if it's compressed
				openlaunchprotocol("text", { "lclfile": unid, "shrinkray": true });
			} else if (mm.type.startsWith("text/html")) {
				openlaunchprotocol("studio", { "lclfile": unid });
			} else {
				openlaunchprotocol("text", { "lclfile": unid });
			}
		}
		refresh();
	} catch (error) {
		console.error(":( Error:", error);
	}
}

function dewallblur() {
	let f = localStorage.getItem("qsets");
	if (f) {
		f = JSON.parse(f); // Assuming it's JSON data
		if (f.focusMode) { } else {
			gid("bgimage").style.filter = "blur(0px)";
			return;
		}
	} else {
		// qsets is not defined in localStorage
		return;
	}
	console.log("dewallblur: " + nowapp)
	if (nowapp != "" && nowapp != undefined) {
		gid("bgimage").style.filter = "blur(5px)";
	} else {
		gid("bgimage").style.filter = "blur(0px)";
	}
}

document.addEventListener("DOMContentLoaded", function() {
	var bgImage = document.getElementById("bgimage");

	bgImage.addEventListener("click", function() {
		nowapp = '';
		dewallblur();
	});
});

function checksnapping(x, event) {
	let f = localStorage.getItem("qsets");
	if (f) {
		f = JSON.parse(f); // Assuming it's JSON data
		if (!f.wsnapping) {
			return;
		}
	}
	var cursorX = event.clientX;
	var cursorY = event.clientY;

	var viewportWidthInPixels = window.innerWidth;
	var viewportHeightInPixels = window.innerHeight;

	var VWInPixels = (3 * viewportWidthInPixels) / 100;
	var VHInPixels = (3 * viewportHeightInPixels) / 100;

	if (fulsapp) {
		x.classList.add("transp2");
		x.getElementsByClassName("flbtn")[0].innerHTML = "web_asset";
		x.style = "left: calc(50vw - 200px);top: calc(50vh - 135px); width: 381px; height: 227px;";
		checktaskbar();
		fulsapp = false;
		setTimeout(() => {
			x.classList.remove("transp2");
		}, 1000);
	}

	if (cursorY < VHInPixels || (viewportHeightInPixels - cursorY) < VHInPixels) {
		x.classList.add("transp2");
		x.style = "left: 3px; top: 3px; width: calc(100% - 7px); height: calc(100% - 63px);";
		fulsapp = true;
		x.getElementsByClassName("flbtn")[0].innerHTML = "filter_none";
		checktaskbar();
		setTimeout(() => {
			x.classList.remove("transp2");
		}, 1000);
	}

	// left
	if (cursorX < VWInPixels) {
		x.classList.add("transp2");
		x.style = "left: 3px; top: 3px; width: calc(50% - 5px); height: calc(100% - 63px);";
		fulsapp = true;
		x.getElementsByClassName("flbtn")[0].innerHTML = "filter_none";
		checktaskbar();
		setTimeout(() => {
			x.classList.remove("transp2");
		}, 1000);
	}

	// right
	if ((viewportWidthInPixels - cursorX) < VWInPixels) {
		x.classList.add("transp2");
		x.style = "right: 3px; top: 3px; width: calc(50% - 5px); height: calc(100% - 63px);";
		fulsapp = true;
		x.getElementsByClassName("flbtn")[0].innerHTML = "filter_none";
		checktaskbar();
		setTimeout(() => {
			x.classList.remove("transp2");
		}, 1000);
	}
}

function togglepowermenu() {
	let menu = document.getElementById("bobthedropdown");
	if (menu.style.visibility == "hidden") {
		menu.style.visibility = "visible"
	} else {
		menu.style.visibility = "hidden"
	}
}

let countdown;

function startTimer(minutes) {
	document.getElementById("sleepbtns").style.display = "none";
	clearInterval(countdown);
	const now = Date.now();
	const then = now + minutes * 60 * 1000;
	displayTimeLeft(minutes * 60);
	countdown = setInterval(() => {
		const secondsLeft = Math.round((then - Date.now()) / 1000);
		if (secondsLeft <= 0) {
			clearInterval(countdown);
			document.getElementById('sleeptimer').textContent = '00:00';
			playBeeps();
			document.getElementById('sleepwindow').close()
			return;
		}
		displayTimeLeft(secondsLeft);
	}, 1000);
}

function playBeeps() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  for (let i = 0; i < 6; i++) {
	const oscillator = audioCtx.createOscillator();
	oscillator.type = 'sine';
	oscillator.frequency.value = 1000;
	oscillator.connect(audioCtx.destination);

	setTimeout(() => {
	  oscillator.start();
	  setTimeout(() => oscillator.stop(), 100);
	}, i * 200);
  }
}

async function setMessage() {
	const message = await ask('What should be the message?', 'Do not disturb...');
	document.getElementById('sleepmessage').innerHTML = message;
}

function displayTimeLeft(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainderSeconds = seconds % 60;
	const display = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
	document.getElementById('sleeptimer').textContent = display;
}


async function updateFile(file) {
	try {
		let data = await getdb('trojencat', 'rom');
		for (let folder of data) {
			let index = folder.content.findIndex(f => f.uid === file.uid);
			if (index !== -1) {
				folder.content[index] = file;
				await setdb('trojencat', 'rom', data);
				return;
			}
		}
		console.error(`Failed to update file "${file.name}" in the database.`);
	} catch (error) {
		console.error("Error updating file in the database:", error);
		throw error;
	}
}

function notify(title, description, appname) {
	if (document.getElementById("notification").style.display == "block") {
		document.getElementById("notification").style.display = "none";
		setTimeout(notify(title, description, appname), 500)
	}
	
	var appnameb = document.getElementById('notifappName');
	var descb = document.getElementById('notifappDesc');
	var titleb = document.getElementById('notifTitle');

	if (appnameb && descb && titleb) {
		appnameb.innerText = appname;
		descb.innerText = description;
		titleb.innerText = title;
		const windValues = Object.values(winds).map(Number);

		// Calculate the maximum value from the array
		const maxWindValue = Math.max(...windValues);

		// Set the zIndex
		document.getElementById("notification").style.zIndex = maxWindValue + 1;
		document.getElementById("notification").style.display = "block";
		setTimeout(function() {
			document.getElementById("notification").style.display = "none";
		}, 5000);
	} else {
		console.error("One or more DOM elements not found.");
	}
}
