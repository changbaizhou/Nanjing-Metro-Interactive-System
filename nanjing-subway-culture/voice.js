document.addEventListener('DOMContentLoaded', () => {
    const recordButton = document.getElementById('recordButton');
    const statusElement = document.getElementById('status');
    const resultElement = document.getElementById('result');
    
    let recognition;
    let isRecording = false;
    
    // 检查浏览器是否支持语音识别
    if (!('webkitSpeechRecognition' in window)) {
        statusElement.textContent = '您的浏览器不支持语音识别API';
        recordButton.disabled = true;
        return;
    }
    
    // 创建语音识别对象
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';
    
    recognition.onstart = () => {
        statusElement.textContent = '正在录音...';
        recordButton.classList.add('recording');
        recordButton.querySelector('.text').textContent = '停止录音';
    };
    
    recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        statusElement.textContent = `错误: ${event.error}`;
        stopRecording();
    };
    
    recognition.onend = () => {
        if (isRecording) {
            // 如果仍在录音状态但识别结束，重新启动识别
            recognition.start();
        }
    };
    
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        // 显示临时结果和最终结果
        resultElement.innerHTML = finalTranscript + '<span style="color:#999">' + interimTranscript + '</span>';
    };
    
    // 开始/停止录音
    recordButton.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
    
    function startRecording() {
        isRecording = true;
        recognition.start();
    }
    
    function stopRecording() {
        isRecording = false;
        recognition.stop();
        statusElement.textContent = '准备就绪';
        recordButton.classList.remove('recording');
        recordButton.querySelector('.text').textContent = '开始录音';
    }
});
