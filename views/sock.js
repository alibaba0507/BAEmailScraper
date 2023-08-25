	const socket = io();
    /*
	socket.on('jsonStructure', (jsonStructure) => {
		const jsonOutputDiv = document.getElementById('jsonOutput');
		jsonOutputDiv.innerHTML = jsonStructure;

		// Get all the link elements inside jsonOutput
		const linkElements = jsonOutputDiv.querySelectorAll('.link-div');

		// Wrap each link div in a container div
		linkElements.forEach((linkElement) => {
			const containerDiv = document.createElement('div');
			containerDiv.classList.add('link-container');

			const linkText = linkElement.textContent;

			const removeButton = document.createElement('button');
			removeButton.textContent = 'Remove';
			removeButton.addEventListener('click', () => {
				containerDiv.remove();
			});

			const insertButton = document.createElement('button');
			insertButton.textContent = 'Insert';
			insertButton.addEventListener('click', () => {
				document.getElementById('searchQuery').value = linkText;
			});

			containerDiv.appendChild(linkElement);
			containerDiv.appendChild(removeButton);
			containerDiv.appendChild(insertButton);

			jsonOutputDiv.appendChild(containerDiv);
		});
	});
	*/
	socket.on('jsonStructure', (jsonStructure,searchQuery) => {
	console.log('0--------------------------------------');
    const jsonOutputDiv = document.getElementById('jsonOutput');
    jsonOutputDiv.innerHTML = jsonStructure;

    // Get all the link elements inside jsonOutput
    const linkElements = jsonOutputDiv.querySelectorAll('.link-div');

    // Wrap each link div in a container div and add buttons
    linkElements.forEach((linkElement) => {
        const containerDiv = document.createElement('div');
        containerDiv.classList.add('link-container');

        const linkText = linkElement.textContent;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            containerDiv.remove();
        });

        const insertButton = document.createElement('button');
        insertButton.textContent = 'Insert';
        insertButton.addEventListener('click', () => {
            document.getElementById('searchQuery').value = linkText;
        });

        containerDiv.appendChild(linkElement);

        // Add your logic to style or manipulate the containerDiv here
        if (linkText.includes(searchQuery)) {
            containerDiv.classList.add('search-match-container');
        }

        containerDiv.appendChild(removeButton);
        containerDiv.appendChild(insertButton);

        jsonOutputDiv.appendChild(containerDiv);
    });
});