document.addEventListener('DOMContentLoaded', () => {
    const userTicketDisplay = document.getElementById('userTicket');
    const currentNumberDisplay = document.getElementById('currentNumber');
    const currentNameDisplay = document.getElementById('currentName');
    const getTicketButton = document.getElementById('getTicket');
    const nextTicketButton = document.getElementById('nextTicket');
    const userNameInput = document.getElementById('userName');
  
    // Función para obtener un nuevo ticket
    getTicketButton.addEventListener('click', () => {
      const userName = userNameInput.value.trim();
  
      if (!userName) {
        alert('Por favor, ingresa tu nombre.');
        return;
      }
  
      fetch('/getTicket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName })
      })
        .then(response => response.json())
        .then(data => {
          if (data.ticketNumber) {
            userTicketDisplay.textContent = data.ticketNumber;
            userNameInput.value = '';
          } else if (data.error) {
            alert(data.error);
          }
        })
        .catch(error => console.error('Error:', error));
    });
  
    // Función para atender el siguiente ticket
    nextTicketButton.addEventListener('click', () => {
      fetch('/nextTicket', {
        method: 'POST',
      })
        .then(response => response.json())
        .then(data => {
          if (data.currentNumber) {
            currentNumberDisplay.textContent = data.currentNumber;
            currentNameDisplay.textContent = data.currentName || '-';
          } else if (data.error) {
            alert(data.error);
          }
        })
        .catch(error => console.error('Error:', error));
    });
  
    // Obtener el número y nombre actuales al cargar la página
    fetch('/current')
      .then(response => response.json())
      .then(data => {
        currentNumberDisplay.textContent = data.currentNumber;
        currentNameDisplay.textContent = data.currentName || '-';
      })
      .catch(error => console.error('Error:', error));
  });
  