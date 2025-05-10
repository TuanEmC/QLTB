const illustrations = {
    projector: require('../../assets/illustrations/projector.png'),
    airconditioner: require('../../assets/illustrations/airconditioner.png'),
    computer: require('../../assets/illustrations/computer.png'),
    microphone: require('../../assets/illustrations/microphone.png'),
    speaker: require('../../assets/illustrations/speaker.png'),
    printer: require('../../assets/illustrations/printer.png'),
    photocopy: require('../../assets/illustrations/photocopy.png'),
    smarttv: require('../../assets/illustrations/smarttv.png'),
    placeholder: require('../../assets/illustrations/placeholder.png'),
};

export const getIllustrationForDeviceType = (tenLoai = '') => {
    const lower = tenLoai.toLowerCase();

    if (lower.includes('máy chiếu')) return illustrations.projector;
    if (lower.includes('điều hòa')) return illustrations.airconditioner;
    if (lower.includes('máy tính') || lower.includes('pc')) return illustrations.computer;
    if (lower.includes('micro')) return illustrations.microphone;
    if (lower.includes('loa')) return illustrations.speaker;
    if (lower.includes('máy in')) return illustrations.printer;
    if (lower.includes('photocopy')) return illustrations.photocopy;
    if (lower.includes('tivi') || lower.includes('tv')) return illustrations.smarttv;

    return illustrations.placeholder;
};
