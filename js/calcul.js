function calculateConcrete() {
    const length = parseFloat(document.getElementById('length').value);
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);

    if (!isNaN(length) && !isNaN(width) && !isNaN(height)) {
        const volume = length * width * height;
        document.getElementById('result').innerText = `Объем бетона: ${volume.toFixed(2)} куб. м`;
    } else {
        document.getElementById('result').innerText = 'Пожалуйста, введите корректные значения.';
    }
}