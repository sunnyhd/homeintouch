var DptKey = 'DPT';

var Hex2Dec = function (hex, maxDigits)
{
  hexNumber = "0123456789ABCDEF";
  var address = 0;

  hex = hex.toUpperCase();
  if (hex.length > maxDigits)
  {
    errorNr = 3;
    return 0;
  }

  for (byteCount = 0; byteCount < hex.length; byteCount++)
  {
    if (hexNumber.indexOf(hex.substring(byteCount, byteCount+1)) == -1)
    {
      errorNr = 1;
      return;
    }    
    else
    {
      address = address * 16 + hexNumber.indexOf(hex.substring(byteCount, byteCount+1));
    }     
  }
  return address;
};

var Dec2Hex = function (dec, hexDigits)
{
  hexNumber = "0123456789ABCDEF";
  hex = "";
  if (dec > Math.pow(16, hexDigits))
  {
    errorNr = 4;
    return "";
  }
  while (hexDigits > 0)
  {
    hex = hexNumber.substring(dec % 16, dec % 16 + 1) + hex;    
    dec = dec / 16
    hexDigits = hexDigits - 1;
  }
  return hex;
};

var Eis52Value = function (eis5) {
    var value = eis5 & 0x07ff;
    if ((eis5 & 0x08000) != 0) {
        value |= 0xfffff800;
        value = -value;
    }
    value <<= ((eis5 & 0x07800) >> 11);
    if ((eis5 & 0x08000) != 0) value = -value;

    return value;
};

var Value2Eis5 = function (value)
{
  eis5 = 0;
  exponent = 0;
  
  if (value < 0)
  {
    eis5 = 0x08000;
    value = -value;
  }  
  while (value > 0x07ff)
  {
    value >>= 1;
    exponent++;
  }
  if (eis5 != 0)
    value = - value;
  
  eis5 |= value & 0x7ff;
  eis5 |= (exponent << 11) & 0x07800;
  return eis5 & 0x0ffff;
};

var transformationFunctions = { 'DPT': {
  '1.001': {
    name  : 'DPT_Switch',
    encode: function( phy ){
      return phy;
    },
    decode: function( hex ){
      return hex;
    }
  },
  /*'1.001': {
    name  : 'DPT_Switch',
    encode: function( phy ){
      return (phy | 0x80).toString( 16 );
    },
    decode: function( hex ){
      return parseInt( hex , 16 );
    }
  },*/
  '1': {
    link  : '1.001'
  },
  '1.002': {
    link  : '1.001'
  },
  '1.003': {
    link  : '1.001'
  },
  '1.008': {
    link  : '1.001'
  },
  '1.009': {
    link  : '1.001'
  },
  '1.011': {
    link  : '1.001'
  },
  
  '2': {
    link  : '1.001'
  },
  
  '3': {
    link  : '1.001'
  },
  
  '4.001': {
    name : 'DPT_Char_ASCII',
    encode: function( phy ){
      var val = phy.charCodeAt( 0 ).toString( 16 );
      return (val.length == 1 ? '800' : '80') + val;
    },
    decode: function( hex ){
      return String.fromCharCode(parseInt( hex, 16 ));
    }
  },
  '4': {
    link  : '4.001'
  },
  
  '5.001' : {
    name  : 'DPT_Scaling',
    unit  : '%',
    range : {
      min: 0.0,
      max: 100.0
    },
    encode: function( phy ){
      var val = parseInt( phy * 255 / 100 ).toString( 16 );
      return (val.length == 1 ? '800' : '80') + val;
    },
    decode: function( hex ){
      return parseInt( hex, 16 ) * 100 / 255.0;
    }
  },
  '5.003' : {
    name  : 'DPT_Angle',
    unit  : '°',
    range : {
      min: 0.0,
      max: 360.0
    },
    encode: function( phy ){
      var val = parseInt( phy * 255 / 360 ).toString( 16 );
      return (val.length == 1 ? '800' : '80') + val;
    },
    decode: function( hex ){
      return parseInt( hex, 16 ) * 360 / 255.0;
    }
  },
  '5.004' : {
    name  : 'DPT_Percent_U8',
    unit  : '%',
    range : {
      min: 0.0,
      max: 255.0
    },
    encode: function( phy ){
      var val = parseInt( phy ).toString( 16 );
      return (val.length == 1 ? '800' : '80') + val;
    },
    decode: function( hex ){
      return parseInt( hex, 16 );
    }
  },
  '5.010': {
    link  : '5.004',
    name  : 'DPT_Value_1_Ucount',
    unit  : '-'
  },
  '5': {
    link  : '5.004',
    name  : '8-Bit Unsigned Value'
  },
  
  '6.001' : {
    name  : 'DPT_Percent_V8',
    encode: function( phy ){
      var val = phy < 0 ? phy + 256 : phy;
      val = val.toString( 16 );
      return (val.length == 1 ? '800' : '80') + val;
    },
    decode: function( hex ){
      var val = parseInt( hex, 16 )
      return val > 127 ? (val-256) : val;
    }
  },
  '6': {
    link  : '6.001'
  },
  
  '7.001' : {
    name  : 'DPT_Value_2_Ucount',
    encode: function( phy ){
      var val = phy.toString( 16 );
      return (val.length == 1 ? '800' : '80') + val;
    },
    decode: function( hex ){ 
      return parseInt( hex, 16 );
    }
  },
  '7': {
    link  : '7.001'
  },
  
  '8.001' : {
    name  : 'DPT_Value_2_Count',
    encode: function( phy ){
      var val = phy < 0 ? phy + 65536 : phy;
      return '80' + val.toString( 16 );
    },
    decode: function( hex ){
      var val = parseInt( hex, 16 );
      return val > 32767 ? (val-65536) : val;
    }
  },
  '8': {
    link  : '8.001'
  },
  
  '9.001' : {
    name  : 'DPT_Value_Temp',
    encode: function( phy ){
      return Dec2Hex(Value2Eis5(phy * 100), 4);
    },
    decode: function( hex ){
      if (hex.indexOf('x') > 0) {
        hex = hex.split('x')[1];
      }
      return Eis52Value(Hex2Dec(hex, 4))/100;
    }
  },
  '9.004': {
    link  : '9.001'
  },
  '9.007': {
    link  : '9.001'
  },
  '9.008': {
    link  : '9.001'
  },
  '9.020': {
    link  : '9.001'
  },
  '9.021': {
    link  : '9.001'
  },
  '9': {
    link  : '9.001'
  },
  
  '10.001' : {
    name  : 'DPT_TimeOfDay',
    encode: function( phy ){
      var val = zeroFillString( ((phy.getDay() << 5) + phy.getHours()).toString(16), 2);
      val += zeroFillString( phy.getMinutes().toString(16), 2 );
      val += zeroFillString( phy.getSeconds().toString(16), 2 );
      return '80' + val;
    },
    decode: function( hex ){ 
      var date = new Date(); // assume today
      date.setHours  ( parseInt(hex.substr(0,2),16) & 0x1F );
      date.setMinutes( parseInt(hex.substr(2,2),16)        );
      date.setSeconds( parseInt(hex.substr(4,2),16)        );
      // as KNX thinks the day of the week belongs to the time, but JavaScript
      // doesn't, tweak the date till it fits...
      var day = (parseInt(hex.substr(0,2),16) & 0xE0) >> 5;
      if( day > 0 )
      {
        var dayShift = (day - date.getDay()) % 7;
        date.setDate( date.getDate() + dayShift );
      }
      return date;
    }
  },

  '11.001' : {
    name  : 'DPT_Date',
    encode: function( phy ){
      // FIXME
    },
    decode: function( hex ){ 
      var year = parseInt(hex.substr(4,2),16) & 0x7F;
      return new Date(year < 90 ? year+2000 : year+1900, //1990 - 2089
                      (parseInt(hex.substr(2,2),16) & 0x0F) - 1,
                      parseInt(hex.substr(0,2),16) & 0x1F);
    }
  },
  
  '12.001' : {
    name  : 'DPT_Value_4_Ucount',
    encode: function( phy ){
      var val = phy.toString( 16 );
      return (val.length == 1 ? '800' : '80') + val;
    },
    decode: function( hex ){ 
      return parseInt( hex, 16 );
    }
  },
  '12': {
    link  : '12.001'
  },
  
  '13.001' : {
    name  : 'DPT_Value_4_Count',
    encode: function( phy ){
      var val = phy < 0 ? phy + 4294967296 : phy;
      val = val.toString( 16 );
      return (val.length == 1 ? '800' : '80') + val;
    },
    decode: function( hex ){
      var val = parseInt( hex, 16 );
      return val > 2147483647 ? (val-4294967296) : val;
    }
  },
  '13': {
    link  : '13.001'
  },
  
  '14.001' : {
    name  : 'DPT_Value_Acceleration_Angular',
    encode: function( phy ){
      return '80' + phy;
    },
    decode: function( hex ){
      var val = parseInt( hex, 16 );
      var sign = (val & 0x80000000) ? -1 : 1;
      var exp  =((val & 0x7F800000) >> 23) - 127;
      var mant = (val & 0x007FFFFF | 0x00800000);
      return sign * Math.pow( 2, exp ) * ( mant / (1 << 23));
    }
  },
  '14': {
    link  : '14.001',
    name  : '4 byte float',
    lname : {
      'de': '4 Byte Gleitkommazahl'
    },
    unit  : '-'
  },
  '16.001' : {
    name  : 'DPT_String_8859_1',
    lname : {
      'de': '14 Byte Text ISO-8859-1'
    },
    encode: function( phy ){
      var val = '80';
      for( var i = 0; i < 14; i++ )
      {
        var c = phy.charCodeAt( i );
        val += c ? ( (c < 16 ? '0' : '') + c.toString( 16 ) ) : '00';
      }
      return val;
    },
    decode: function( hex ){
      var val="";        
      var chars;
      for (var i=0;i<28;i=i+2) {
          chars=parseInt(hex.substr(i,2),16);
          if (chars>0) {
            val+=String.fromCharCode(chars);
          }
      }
      return val;
    }
  },
  '16.000': {
    link  : '16.001',
    name  : 'DPT_String_ASCII',
    lname : {
      'de': '14 Byte Text ASCII'
    },
    unit  : '-'
  },
  '16': {
    link  : '16.001',
    name  : 'DPT_String_ASCII',
    lname : {
      'de': '14 Byte Text ASCII'
    },
    unit  : '-'
  },
  '20.102': {
    name  : 'DPT_HVACMode',
    lname : {
      'de': 'KONNEX Betriebsart'
    },
    unit  : '-',
    range : {
      'enum': [ 'auto', 'comfort', 'standby', 'economy', 'building_protection' ]
    },
    encode: function( phy ){
      var val;
      switch( phy )
      {
        case 1: 
        case 'comfort':
          val = 1;
          break;
        case 2: 
        case 'standby':
          val = 2;
          break;
        case 3: 
        case 'night':
          val = 3;
          break;
        case 4: 
        case 'frost':
          val = 4;
          break;
        default: // actually "case 0:" / "auto"
          val = 0;
      }
      val = val.toString( 16 );
      return (val.length == 1 ? '800' : '80') + val;
    },
    decode: function( hex ){
      switch( parseInt( hex, 16 ) )
      {
        case 1: 
          return 'comfort';
        case 2: 
          return 'standby';
        case 3: 
          return 'night';
        case 4: 
          return 'frost';
        default: // actually "case 0:"
          return 'auto';
      }
    },
  }
} };

var getDptObject = function(dptType) {
  var dptTransformations = transformationFunctions[DptKey];
  var dptObject = dptTransformations[dptType];
  var dptLink = dptObject.link;
  
  if (dptLink) {
    dptObject = dptTransformations[dptLink];
  }

  return dptObject;
}

exports.getDptEncode = function(dptType) {

  var dptObject = getDptObject(dptType);
  return dptObject.encode;
};

exports.getDptDecode = function(dptType) {

  var dptObject = getDptObject(dptType);
  return dptObject.decode;
};