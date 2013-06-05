
function unsign(value, bytes) {
   return value >= 0 ? value : Math.pow(256, bytes || 4) + value;
}

exports.generate = function(data) {
   var CRC = 0xffffffff;
   for ( var j = 0; j < data.length; j++) {
      var c = data.charCodeAt(j);
      CRC ^= c << 24;
      for ( var i = 0; i < 8; i++) {
         if (unsign(CRC, 8) & 0x80000000) {
            CRC = (CRC << 1) ^ 0x04C11DB7;
         } else {
            CRC <<= 1;
         }
      }
   }
   if (CRC < 0)
      CRC = CRC >>> 0;
   var CRC_str = CRC.toString(16);
   while (CRC_str.length < 8) {
      CRC_str = '0' + CRC_str;
   }
   return CRC_str;
}