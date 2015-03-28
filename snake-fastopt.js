'use strict';
/* Scala.js runtime support
 * Copyright 2013 LAMP/EPFL
 * Author: Sébastien Doeraene
 */

/* ---------------------------------- *
 * The top-level Scala.js environment *
 * ---------------------------------- */

var ScalaJS = {};

// Get the environment info
ScalaJS.env = (typeof __ScalaJSEnv === "object" && __ScalaJSEnv) ? __ScalaJSEnv : {};

// Global scope
ScalaJS.g =
  (typeof ScalaJS.env["global"] === "object" && ScalaJS.env["global"])
    ? ScalaJS.env["global"]
    : ((typeof global === "object" && global && global["Object"] === Object) ? global : this);
ScalaJS.env["global"] = ScalaJS.g;

// Where to send exports
ScalaJS.e =
  (typeof ScalaJS.env["exportsNamespace"] === "object" && ScalaJS.env["exportsNamespace"])
    ? ScalaJS.env["exportsNamespace"] : ScalaJS.g;
ScalaJS.env["exportsNamespace"] = ScalaJS.e;

// Freeze the environment info
ScalaJS.g["Object"]["freeze"](ScalaJS.env);

// Other fields
ScalaJS.d = {};         // Data for types
ScalaJS.c = {};         // Scala.js constructors
ScalaJS.h = {};         // Inheritable constructors (without initialization code)
ScalaJS.s = {};         // Static methods
ScalaJS.n = {};         // Module instances
ScalaJS.m = {};         // Module accessors
ScalaJS.is = {};        // isInstanceOf methods
ScalaJS.isArrayOf = {}; // isInstanceOfArrayOf methods

ScalaJS.as = {};        // asInstanceOf methods
ScalaJS.asArrayOf = {}; // asInstanceOfArrayOf methods

ScalaJS.lastIDHash = 0; // last value attributed to an id hash code

// Core mechanism

ScalaJS.makeIsArrayOfPrimitive = function(primitiveData) {
  return function(obj, depth) {
    return !!(obj && obj.$classData &&
      (obj.$classData.arrayDepth === depth) &&
      (obj.$classData.arrayBase === primitiveData));
  }
};


ScalaJS.makeAsArrayOfPrimitive = function(isInstanceOfFunction, arrayEncodedName) {
  return function(obj, depth) {
    if (isInstanceOfFunction(obj, depth) || (obj === null))
      return obj;
    else
      ScalaJS.throwArrayCastException(obj, arrayEncodedName, depth);
  }
};


/** Encode a property name for runtime manipulation
  *  Usage:
  *    env.propertyName({someProp:0})
  *  Returns:
  *    "someProp"
  *  Useful when the property is renamed by a global optimizer (like Closure)
  *  but we must still get hold of a string of that name for runtime
  * reflection.
  */
ScalaJS.propertyName = function(obj) {
  var result;
  for (var prop in obj)
    result = prop;
  return result;
};

// Runtime functions

ScalaJS.isScalaJSObject = function(obj) {
  return !!(obj && obj.$classData);
};


ScalaJS.throwClassCastException = function(instance, classFullName) {




  throw new ScalaJS.c.sjsr_UndefinedBehaviorError().init___jl_Throwable(
    new ScalaJS.c.jl_ClassCastException().init___T(
      instance + " is not an instance of " + classFullName));

};

ScalaJS.throwArrayCastException = function(instance, classArrayEncodedName, depth) {
  for (; depth; --depth)
    classArrayEncodedName = "[" + classArrayEncodedName;
  ScalaJS.throwClassCastException(instance, classArrayEncodedName);
};


ScalaJS.noIsInstance = function(instance) {
  throw new ScalaJS.g["TypeError"](
    "Cannot call isInstance() on a Class representing a raw JS trait/object");
};

ScalaJS.makeNativeArrayWrapper = function(arrayClassData, nativeArray) {
  return new arrayClassData.constr(nativeArray);
};

ScalaJS.newArrayObject = function(arrayClassData, lengths) {
  return ScalaJS.newArrayObjectInternal(arrayClassData, lengths, 0);
};

ScalaJS.newArrayObjectInternal = function(arrayClassData, lengths, lengthIndex) {
  var result = new arrayClassData.constr(lengths[lengthIndex]);

  if (lengthIndex < lengths.length-1) {
    var subArrayClassData = arrayClassData.componentData;
    var subLengthIndex = lengthIndex+1;
    var underlying = result.u;
    for (var i = 0; i < underlying.length; i++) {
      underlying[i] = ScalaJS.newArrayObjectInternal(
        subArrayClassData, lengths, subLengthIndex);
    }
  }

  return result;
};

ScalaJS.checkNonNull = function(obj) {
  return obj !== null ? obj : ScalaJS.throwNullPointerException();
};

ScalaJS.throwNullPointerException = function() {
  throw new ScalaJS.c.jl_NullPointerException().init___();
};

ScalaJS.objectToString = function(instance) {
  if (instance === void 0)
    return "undefined";
  else
    return instance.toString();
};

ScalaJS.objectGetClass = function(instance) {
  switch (typeof instance) {
    case "string":
      return ScalaJS.d.T.getClassOf();
    case "number":
      var v = instance | 0;
      if (v === instance) { // is the value integral?
        if (ScalaJS.isByte(v))
          return ScalaJS.d.jl_Byte.getClassOf();
        else if (ScalaJS.isShort(v))
          return ScalaJS.d.jl_Short.getClassOf();
        else
          return ScalaJS.d.jl_Integer.getClassOf();
      } else {
        if (ScalaJS.isFloat(instance))
          return ScalaJS.d.jl_Float.getClassOf();
        else
          return ScalaJS.d.jl_Double.getClassOf();
      }
    case "boolean":
      return ScalaJS.d.jl_Boolean.getClassOf();
    case "undefined":
      return ScalaJS.d.sr_BoxedUnit.getClassOf();
    default:
      if (instance === null)
        ScalaJS.throwNullPointerException();
      else if (ScalaJS.is.sjsr_RuntimeLong(instance))
        return ScalaJS.d.jl_Long.getClassOf();
      else if (ScalaJS.isScalaJSObject(instance))
        return instance.$classData.getClassOf();
      else
        return null; // Exception?
  }
};

ScalaJS.objectClone = function(instance) {
  if (ScalaJS.isScalaJSObject(instance) || (instance === null))
    return instance.clone__O();
  else
    throw new ScalaJS.c.jl_CloneNotSupportedException().init___();
};

ScalaJS.objectNotify = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notify__V();
};

ScalaJS.objectNotifyAll = function(instance) {
  // final and no-op in java.lang.Object
  if (instance === null)
    instance.notifyAll__V();
};

ScalaJS.objectFinalize = function(instance) {
  if (ScalaJS.isScalaJSObject(instance) || (instance === null))
    instance.finalize__V();
  // else no-op
};

ScalaJS.objectEquals = function(instance, rhs) {
  if (ScalaJS.isScalaJSObject(instance) || (instance === null))
    return instance.equals__O__Z(rhs);
  else if (typeof instance === "number")
    return typeof rhs === "number" && ScalaJS.numberEquals(instance, rhs);
  else
    return instance === rhs;
};

ScalaJS.numberEquals = function(lhs, rhs) {
  return (lhs === rhs) ? (
    // 0.0.equals(-0.0) must be false
    lhs !== 0 || 1/lhs === 1/rhs
  ) : (
    // are they both NaN?
    (lhs !== lhs) && (rhs !== rhs)
  );
};

ScalaJS.objectHashCode = function(instance) {
  switch (typeof instance) {
    case "string":
      return ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I(instance);
    case "number":
      return ScalaJS.m.sjsr_Bits$().numberHashCode__D__I(instance);
    case "boolean":
      return instance ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      if (ScalaJS.isScalaJSObject(instance) || instance === null)
        return instance.hashCode__I();
      else
        return 42; // TODO?
  }
};

ScalaJS.comparableCompareTo = function(instance, rhs) {
  switch (typeof instance) {
    case "string":

      ScalaJS.as.T(rhs);

      return instance === rhs ? 0 : (instance < rhs ? -1 : 1);
    case "number":

      ScalaJS.as.jl_Number(rhs);

      return ScalaJS.m.jl_Double$().compare__D__D__I(instance, rhs);
    case "boolean":

      ScalaJS.asBoolean(rhs);

      return instance - rhs; // yes, this gives the right result
    default:
      return instance.compareTo__O__I(rhs);
  }
};

ScalaJS.charSequenceLength = function(instance) {
  if (typeof(instance) === "string")

    return ScalaJS.uI(instance["length"]);



  else
    return instance.length__I();
};

ScalaJS.charSequenceCharAt = function(instance, index) {
  if (typeof(instance) === "string")

    return ScalaJS.uI(instance["charCodeAt"](index)) & 0xffff;



  else
    return instance.charAt__I__C(index);
};

ScalaJS.charSequenceSubSequence = function(instance, start, end) {
  if (typeof(instance) === "string")

    return ScalaJS.as.T(instance["substring"](start, end));



  else
    return instance.subSequence__I__I__jl_CharSequence(start, end);
};

ScalaJS.booleanBooleanValue = function(instance) {
  if (typeof instance === "boolean") return instance;
  else                               return instance.booleanValue__Z();
};

ScalaJS.numberByteValue = function(instance) {
  if (typeof instance === "number") return (instance << 24) >> 24;
  else                              return instance.byteValue__B();
};
ScalaJS.numberShortValue = function(instance) {
  if (typeof instance === "number") return (instance << 16) >> 16;
  else                              return instance.shortValue__S();
};
ScalaJS.numberIntValue = function(instance) {
  if (typeof instance === "number") return instance | 0;
  else                              return instance.intValue__I();
};
ScalaJS.numberLongValue = function(instance) {
  if (typeof instance === "number")
    return ScalaJS.m.sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(instance);
  else
    return instance.longValue__J();
};
ScalaJS.numberFloatValue = function(instance) {
  if (typeof instance === "number") return ScalaJS.fround(instance);
  else                              return instance.floatValue__F();
};
ScalaJS.numberDoubleValue = function(instance) {
  if (typeof instance === "number") return instance;
  else                              return instance.doubleValue__D();
};

ScalaJS.isNaN = function(instance) {
  return instance !== instance;
};

ScalaJS.isInfinite = function(instance) {
  return !ScalaJS.g["isFinite"](instance) && !ScalaJS.isNaN(instance);
};

ScalaJS.propertiesOf = function(obj) {
  var result = [];
  for (var prop in obj)
    result["push"](prop);
  return result;
};

ScalaJS.systemArraycopy = function(src, srcPos, dest, destPos, length) {
  var srcu = src.u;
  var destu = dest.u;
  if (srcu !== destu || destPos < srcPos || srcPos + length < destPos) {
    for (var i = 0; i < length; i++)
      destu[destPos+i] = srcu[srcPos+i];
  } else {
    for (var i = length-1; i >= 0; i--)
      destu[destPos+i] = srcu[srcPos+i];
  }
};

ScalaJS.systemIdentityHashCode = function(obj) {
  if (ScalaJS.isScalaJSObject(obj)) {
    var hash = obj["$idHashCode$0"];
    if (hash !== void 0) {
      return hash;
    } else {
      hash = (ScalaJS.lastIDHash + 1) | 0;
      ScalaJS.lastIDHash = hash;
      obj["$idHashCode$0"] = hash;
      return hash;
    }
  } else if (obj === null) {
    return 0;
  } else {
    return ScalaJS.objectHashCode(obj);
  }
};

// is/as for hijacked boxed classes (the non-trivial ones)

ScalaJS.isByte = function(v) {
  return (v << 24 >> 24) === v && 1/v !== 1/-0;
};

ScalaJS.isShort = function(v) {
  return (v << 16 >> 16) === v && 1/v !== 1/-0;
};

ScalaJS.isInt = function(v) {
  return (v | 0) === v && 1/v !== 1/-0;
};

ScalaJS.isFloat = function(v) {
  return v !== v || ScalaJS.fround(v) === v;
};


ScalaJS.asUnit = function(v) {
  if (v === void 0)
    return v;
  else
    ScalaJS.throwClassCastException(v, "scala.runtime.BoxedUnit");
};

ScalaJS.asBoolean = function(v) {
  if (typeof v === "boolean" || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Boolean");
};

ScalaJS.asByte = function(v) {
  if (ScalaJS.isByte(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Byte");
};

ScalaJS.asShort = function(v) {
  if (ScalaJS.isShort(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Short");
};

ScalaJS.asInt = function(v) {
  if (ScalaJS.isInt(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Integer");
};

ScalaJS.asFloat = function(v) {
  if (ScalaJS.isFloat(v) || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Float");
};

ScalaJS.asDouble = function(v) {
  if (typeof v === "number" || v === null)
    return v;
  else
    ScalaJS.throwClassCastException(v, "java.lang.Double");
};


// Unboxes


ScalaJS.uZ = function(value) {
  return !!ScalaJS.asBoolean(value);
};
ScalaJS.uB = function(value) {
  return ScalaJS.asByte(value) | 0;
};
ScalaJS.uS = function(value) {
  return ScalaJS.asShort(value) | 0;
};
ScalaJS.uI = function(value) {
  return ScalaJS.asInt(value) | 0;
};
ScalaJS.uJ = function(value) {
  return null === value ? ScalaJS.m.sjsr_RuntimeLong$().Zero$1
                        : ScalaJS.as.sjsr_RuntimeLong(value);
};
ScalaJS.uF = function(value) {
  /* Here, it is fine to use + instead of fround, because asFloat already
   * ensures that the result is either null or a float. 
   */
  return +ScalaJS.asFloat(value);
};
ScalaJS.uD = function(value) {
  return +ScalaJS.asDouble(value);
};






// TypeArray conversions

ScalaJS.byteArray2TypedArray = function(value) { return new Int8Array(value.u); };
ScalaJS.shortArray2TypedArray = function(value) { return new Int16Array(value.u); };
ScalaJS.charArray2TypedArray = function(value) { return new Uint16Array(value.u); };
ScalaJS.intArray2TypedArray = function(value) { return new Int32Array(value.u); };
ScalaJS.floatArray2TypedArray = function(value) { return new Float32Array(value.u); };
ScalaJS.doubleArray2TypedArray = function(value) { return new Float64Array(value.u); };

ScalaJS.typedArray2ByteArray = function(value) {
  var arrayClassData = ScalaJS.d.B.getArrayOf();
  return new arrayClassData.constr(new Int8Array(value));
};
ScalaJS.typedArray2ShortArray = function(value) {
  var arrayClassData = ScalaJS.d.S.getArrayOf();
  return new arrayClassData.constr(new Int16Array(value));
};
ScalaJS.typedArray2CharArray = function(value) {
  var arrayClassData = ScalaJS.d.C.getArrayOf();
  return new arrayClassData.constr(new Uint16Array(value));
};
ScalaJS.typedArray2IntArray = function(value) {
  var arrayClassData = ScalaJS.d.I.getArrayOf();
  return new arrayClassData.constr(new Int32Array(value));
};
ScalaJS.typedArray2FloatArray = function(value) {
  var arrayClassData = ScalaJS.d.F.getArrayOf();
  return new arrayClassData.constr(new Float32Array(value));
};
ScalaJS.typedArray2DoubleArray = function(value) {
  var arrayClassData = ScalaJS.d.D.getArrayOf();
  return new arrayClassData.constr(new Float64Array(value));
};

/* We have to force a non-elidable *read* of ScalaJS.e, otherwise Closure will
 * eliminate it altogether, along with all the exports, which is ... er ...
 * plain wrong.
 */
this["__ScalaJSExportsNamespace"] = ScalaJS.e;

// Type data constructors

/** @constructor */
ScalaJS.PrimitiveTypeData = function(zero, arrayEncodedName, displayName) {
  // Runtime support
  this.constr = undefined;
  this.parentData = undefined;
  this.ancestors = {};
  this.componentData = null;
  this.zero = zero;
  this.arrayEncodedName = arrayEncodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = function(obj, depth) { return false; };

  // java.lang.Class support
  this["name"] = displayName;
  this["isPrimitive"] = true;
  this["isInterface"] = false;
  this["isArrayClass"] = false;
  this["isInstance"] = function(obj) { return false; };
};

/** @constructor */
ScalaJS.ClassTypeData = function(internalNameObj, isInterface, fullName,
                                 ancestors, parentData, isInstance, isArrayOf) {
  var internalName = ScalaJS.propertyName(internalNameObj);

  isInstance = isInstance || function(obj) {
    return !!(obj && obj.$classData && obj.$classData.ancestors[internalName]);
  };

  isArrayOf = isArrayOf || function(obj, depth) {
    return !!(obj && obj.$classData && (obj.$classData.arrayDepth === depth)
      && obj.$classData.arrayBase.ancestors[internalName])
  };

  // Runtime support
  this.constr = undefined;
  this.parentData = parentData;
  this.ancestors = ancestors;
  this.componentData = null;
  this.zero = null;
  this.arrayEncodedName = "L"+fullName+";";
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = isArrayOf;

  // java.lang.Class support
  this["name"] = fullName;
  this["isPrimitive"] = false;
  this["isInterface"] = isInterface;
  this["isArrayClass"] = false;
  this["isInstance"] = isInstance;
};

/** @constructor */
ScalaJS.ArrayTypeData = function(componentData) {
  // The constructor

  var componentZero = componentData.zero;

  // The zero for the Long runtime representation
  // is a special case here, since the class has not
  // been defined yet, when this file is read
  if (componentZero == "longZero")
    componentZero = ScalaJS.m.sjsr_RuntimeLong$().Zero$1;

  /** @constructor */
  var ArrayClass = function(arg) {
    if (typeof(arg) === "number") {
      // arg is the length of the array
      this.u = new Array(arg);
      for (var i = 0; i < arg; i++)
        this.u[i] = componentZero;
    } else {
      // arg is a native array that we wrap
      this.u = arg;
    }
  }
  ArrayClass.prototype = new ScalaJS.h.O;
  ArrayClass.prototype.constructor = ArrayClass;
  ArrayClass.prototype.$classData = this;

  ArrayClass.prototype.clone__O = function() {
    if (this.u instanceof Array)
      return new ArrayClass(this.u["slice"](0));
    else
      // The underlying Array is a TypedArray
      return new ArrayClass(this.u.constructor(this.u));
  };

  // Don't generate reflective call proxies. The compiler special cases
  // reflective calls to methods on scala.Array

  // The data

  var encodedName = "[" + componentData.arrayEncodedName;
  var componentBase = componentData.arrayBase || componentData;
  var componentDepth = componentData.arrayDepth || 0;
  var arrayDepth = componentDepth + 1;

  var isInstance = function(obj) {
    return componentBase.isArrayOf(obj, arrayDepth);
  }

  // Runtime support
  this.constr = ArrayClass;
  this.parentData = ScalaJS.d.O;
  this.ancestors = {O: 1};
  this.componentData = componentData;
  this.arrayBase = componentBase;
  this.arrayDepth = arrayDepth;
  this.zero = null;
  this.arrayEncodedName = encodedName;
  this._classOf = undefined;
  this._arrayOf = undefined;
  this.isArrayOf = undefined;

  // java.lang.Class support
  this["name"] = encodedName;
  this["isPrimitive"] = false;
  this["isInterface"] = false;
  this["isArrayClass"] = true;
  this["isInstance"] = isInstance;
};

ScalaJS.ClassTypeData.prototype.getClassOf = function() {
  if (!this._classOf)
    this._classOf = new ScalaJS.c.jl_Class().init___jl_ScalaJSClassData(this);
  return this._classOf;
};

ScalaJS.ClassTypeData.prototype.getArrayOf = function() {
  if (!this._arrayOf)
    this._arrayOf = new ScalaJS.ArrayTypeData(this);
  return this._arrayOf;
};

// java.lang.Class support

ScalaJS.ClassTypeData.prototype["getFakeInstance"] = function() {
  if (this === ScalaJS.d.T)
    return "some string";
  else if (this === ScalaJS.d.jl_Boolean)
    return false;
  else if (this === ScalaJS.d.jl_Byte ||
           this === ScalaJS.d.jl_Short ||
           this === ScalaJS.d.jl_Integer ||
           this === ScalaJS.d.jl_Float ||
           this === ScalaJS.d.jl_Double)
    return 0;
  else if (this === ScalaJS.d.jl_Long)
    return ScalaJS.m.sjsr_RuntimeLong$().Zero$1;
  else if (this === ScalaJS.d.sr_BoxedUnit)
    return void 0;
  else
    return {$classData: this};
};

ScalaJS.ClassTypeData.prototype["getSuperclass"] = function() {
  return this.parentData ? this.parentData.getClassOf() : null;
};

ScalaJS.ClassTypeData.prototype["getComponentType"] = function() {
  return this.componentData ? this.componentData.getClassOf() : null;
};

ScalaJS.ClassTypeData.prototype["newArrayOfThisClass"] = function(lengths) {
  var arrayClassData = this;
  for (var i = 0; i < lengths.length; i++)
    arrayClassData = arrayClassData.getArrayOf();
  return ScalaJS.newArrayObject(arrayClassData, lengths);
};

ScalaJS.PrimitiveTypeData.prototype = ScalaJS.ClassTypeData.prototype;
ScalaJS.ArrayTypeData.prototype = ScalaJS.ClassTypeData.prototype;

// Create primitive types

ScalaJS.d.V = new ScalaJS.PrimitiveTypeData(undefined, "V", "void");
ScalaJS.d.Z = new ScalaJS.PrimitiveTypeData(false, "Z", "boolean");
ScalaJS.d.C = new ScalaJS.PrimitiveTypeData(0, "C", "char");
ScalaJS.d.B = new ScalaJS.PrimitiveTypeData(0, "B", "byte");
ScalaJS.d.S = new ScalaJS.PrimitiveTypeData(0, "S", "short");
ScalaJS.d.I = new ScalaJS.PrimitiveTypeData(0, "I", "int");
ScalaJS.d.J = new ScalaJS.PrimitiveTypeData("longZero", "J", "long");
ScalaJS.d.F = new ScalaJS.PrimitiveTypeData(0.0, "F", "float");
ScalaJS.d.D = new ScalaJS.PrimitiveTypeData(0.0, "D", "double");

// Instance tests for array of primitives

ScalaJS.isArrayOf.Z = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.Z);
ScalaJS.d.Z.isArrayOf = ScalaJS.isArrayOf.Z;

ScalaJS.isArrayOf.C = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.C);
ScalaJS.d.C.isArrayOf = ScalaJS.isArrayOf.C;

ScalaJS.isArrayOf.B = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.B);
ScalaJS.d.B.isArrayOf = ScalaJS.isArrayOf.B;

ScalaJS.isArrayOf.S = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.S);
ScalaJS.d.S.isArrayOf = ScalaJS.isArrayOf.S;

ScalaJS.isArrayOf.I = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.I);
ScalaJS.d.I.isArrayOf = ScalaJS.isArrayOf.I;

ScalaJS.isArrayOf.J = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.J);
ScalaJS.d.J.isArrayOf = ScalaJS.isArrayOf.J;

ScalaJS.isArrayOf.F = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.F);
ScalaJS.d.F.isArrayOf = ScalaJS.isArrayOf.F;

ScalaJS.isArrayOf.D = ScalaJS.makeIsArrayOfPrimitive(ScalaJS.d.D);
ScalaJS.d.D.isArrayOf = ScalaJS.isArrayOf.D;


// asInstanceOfs for array of primitives
ScalaJS.asArrayOf.Z = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.Z, "Z");
ScalaJS.asArrayOf.C = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.C, "C");
ScalaJS.asArrayOf.B = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.B, "B");
ScalaJS.asArrayOf.S = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.S, "S");
ScalaJS.asArrayOf.I = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.I, "I");
ScalaJS.asArrayOf.J = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.J, "J");
ScalaJS.asArrayOf.F = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.F, "F");
ScalaJS.asArrayOf.D = ScalaJS.makeAsArrayOfPrimitive(ScalaJS.isArrayOf.D, "D");


// Polyfills

ScalaJS.imul = ScalaJS.g["Math"]["imul"] || (function(a, b) {
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
});

ScalaJS.fround = ScalaJS.g["Math"]["fround"] ||









  (function(v) {
    return +v;
  });

/** @constructor */
ScalaJS.c.O = (function() {
  /*<skip>*/
});
/** @constructor */
ScalaJS.h.O = (function() {
  /*<skip>*/
});
ScalaJS.h.O.prototype = ScalaJS.c.O.prototype;
ScalaJS.c.O.prototype.init___ = (function() {
  return this
});
ScalaJS.c.O.prototype.equals__O__Z = (function(that) {
  return (this === that)
});
ScalaJS.c.O.prototype.toString__T = (function() {
  var jsx$2 = ScalaJS.objectGetClass(this).getName__T();
  var i = this.hashCode__I();
  var x = ScalaJS.uD((i >>> 0));
  var jsx$1 = x["toString"](16);
  return ((jsx$2 + "@") + ScalaJS.as.T(jsx$1))
});
ScalaJS.c.O.prototype.hashCode__I = (function() {
  return ScalaJS.systemIdentityHashCode(this)
});
ScalaJS.c.O.prototype["toString"] = (function() {
  return this.toString__T()
});
ScalaJS.is.O = (function(obj) {
  return (obj !== null)
});
ScalaJS.as.O = (function(obj) {
  return obj
});
ScalaJS.isArrayOf.O = (function(obj, depth) {
  var data = (obj && obj.$classData);
  if ((!data)) {
    return false
  } else {
    var arrayDepth = (data.arrayDepth || 0);
    return ((!(arrayDepth < depth)) && ((arrayDepth > depth) || (!data.arrayBase["isPrimitive"])))
  }
});
ScalaJS.asArrayOf.O = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.O(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Object;", depth))
});
ScalaJS.d.O = new ScalaJS.ClassTypeData({
  O: 0
}, false, "java.lang.Object", {
  O: 1
}, (void 0), ScalaJS.is.O, ScalaJS.isArrayOf.O);
ScalaJS.c.O.prototype.$classData = ScalaJS.d.O;
ScalaJS.is.sc_GenTraversableOnce = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversableOnce)))
});
ScalaJS.as.sc_GenTraversableOnce = (function(obj) {
  return ((ScalaJS.is.sc_GenTraversableOnce(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenTraversableOnce"))
});
ScalaJS.isArrayOf.sc_GenTraversableOnce = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversableOnce)))
});
ScalaJS.asArrayOf.sc_GenTraversableOnce = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenTraversableOnce(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenTraversableOnce;", depth))
});
/** @constructor */
ScalaJS.c.Ljs_webapp_Snake$SnakeModel = (function() {
  ScalaJS.c.O.call(this);
  this.width$1 = 0;
  this.height$1 = 0;
  this.snake$1 = null;
  this.direction$1 = null
});
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype = new ScalaJS.h.O();
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype.constructor = ScalaJS.c.Ljs_webapp_Snake$SnakeModel;
/** @constructor */
ScalaJS.h.Ljs_webapp_Snake$SnakeModel = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljs_webapp_Snake$SnakeModel.prototype = ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype;
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype.validate__Ljs_webapp_Snake$Point2__Z = (function(pos) {
  if (((((pos.x$1 >= 0) && (pos.y$1 >= 0)) && (pos.x$1 < this.width$1)) && (pos.y$1 < this.height$1))) {
    var this$1 = this.snake$1;
    var these = this$1;
    while ((!these.isEmpty__Z())) {
      var arg1 = these.head__O();
      var x$1 = ScalaJS.as.Ljs_webapp_Snake$Point2(arg1);
      if ((!(!((x$1 === null) ? (pos === null) : x$1.equals__O__Z(pos))))) {
        return false
      };
      these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
    };
    return true
  } else {
    return false
  }
});
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype.up__V = (function() {
  this.direction$1 = new ScalaJS.c.Ljs_webapp_Snake$Point2().init___I__I(0, (-1))
});
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype.init___I__I = (function(width, height) {
  this.width$1 = width;
  this.height$1 = height;
  this.snake$1 = ScalaJS.as.scm_Queue(ScalaJS.m.scm_Queue$().apply__sc_Seq__sc_GenTraversable(ScalaJS.m.sci_Nil$()));
  var i = 1;
  var count = 0;
  while ((i !== 21)) {
    var v1 = i;
    var this$4 = this.snake$1;
    var array = [new ScalaJS.c.Ljs_webapp_Snake$Point2().init___I__I(0, v1)];
    matchEnd4: {
      var i$1 = 0;
      var len = ScalaJS.uI(array["length"]);
      while ((i$1 < len)) {
        var index = i$1;
        var arg1 = array[index];
        this$4.$$plus$eq__O__scm_MutableList(arg1);
        i$1 = ((1 + i$1) | 0)
      };
      break matchEnd4
    };
    count = ((1 + count) | 0);
    i = ((1 + i) | 0)
  };
  this.direction$1 = new ScalaJS.c.Ljs_webapp_Snake$Point2().init___I__I(0, 1);
  return this
});
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype.down__V = (function() {
  this.direction$1 = new ScalaJS.c.Ljs_webapp_Snake$Point2().init___I__I(0, 1)
});
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype.move__s_util_Either = (function() {
  var next = ScalaJS.as.Ljs_webapp_Snake$Point2(this.snake$1.last__O()).plus__Ljs_webapp_Snake$Point2__Ljs_webapp_Snake$Point2(this.direction$1);
  if (this.validate__Ljs_webapp_Snake$Point2__Z(next)) {
    var this$1 = this.snake$1;
    var array = [next];
    matchEnd4: {
      var i = 0;
      var len = ScalaJS.uI(array["length"]);
      while ((i < len)) {
        var index = i;
        var arg1 = array[index];
        this$1.$$plus$eq__O__scm_MutableList(arg1);
        i = ((1 + i) | 0)
      };
      break matchEnd4
    };
    var tail = ScalaJS.as.Ljs_webapp_Snake$Point2(this.snake$1.dequeue__O());
    ScalaJS.m.s_package$().Right$1;
    ScalaJS.m.sci_List$();
    var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([new ScalaJS.c.T2().init___O__O("body", next), new ScalaJS.c.T2().init___O__O("field", tail)]);
    var this$7 = ScalaJS.m.sci_List$();
    var cbf = this$7.ReusableCBFInstance$2;
    var b = ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf));
    return new ScalaJS.c.s_util_Right().init___O(b)
  } else {
    ScalaJS.m.s_package$().Left$1;
    return new ScalaJS.c.s_util_Left().init___O("gameover")
  }
});
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype.rigth__V = (function() {
  this.direction$1 = new ScalaJS.c.Ljs_webapp_Snake$Point2().init___I__I(1, 0)
});
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype.left__V = (function() {
  this.direction$1 = new ScalaJS.c.Ljs_webapp_Snake$Point2().init___I__I((-1), 0)
});
ScalaJS.d.Ljs_webapp_Snake$SnakeModel = new ScalaJS.ClassTypeData({
  Ljs_webapp_Snake$SnakeModel: 0
}, false, "js.webapp.Snake$SnakeModel", {
  Ljs_webapp_Snake$SnakeModel: 1,
  O: 1
});
ScalaJS.c.Ljs_webapp_Snake$SnakeModel.prototype.$classData = ScalaJS.d.Ljs_webapp_Snake$SnakeModel;
/** @constructor */
ScalaJS.c.jl_Class = (function() {
  ScalaJS.c.O.call(this);
  this.data$1 = null
});
ScalaJS.c.jl_Class.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Class.prototype.constructor = ScalaJS.c.jl_Class;
/** @constructor */
ScalaJS.h.jl_Class = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Class.prototype = ScalaJS.c.jl_Class.prototype;
ScalaJS.c.jl_Class.prototype.getName__T = (function() {
  return ScalaJS.as.T(this.data$1["name"])
});
ScalaJS.c.jl_Class.prototype.isPrimitive__Z = (function() {
  return ScalaJS.uZ(this.data$1["isPrimitive"])
});
ScalaJS.c.jl_Class.prototype.toString__T = (function() {
  return ((this.isInterface__Z() ? "interface " : (this.isPrimitive__Z() ? "" : "class ")) + this.getName__T())
});
ScalaJS.c.jl_Class.prototype.isAssignableFrom__jl_Class__Z = (function(that) {
  return ((this.isPrimitive__Z() || that.isPrimitive__Z()) ? ((this === that) || ((this === ScalaJS.d.S.getClassOf()) ? (that === ScalaJS.d.B.getClassOf()) : ((this === ScalaJS.d.I.getClassOf()) ? ((that === ScalaJS.d.B.getClassOf()) || (that === ScalaJS.d.S.getClassOf())) : ((this === ScalaJS.d.F.getClassOf()) ? (((that === ScalaJS.d.B.getClassOf()) || (that === ScalaJS.d.S.getClassOf())) || (that === ScalaJS.d.I.getClassOf())) : ((this === ScalaJS.d.D.getClassOf()) && ((((that === ScalaJS.d.B.getClassOf()) || (that === ScalaJS.d.S.getClassOf())) || (that === ScalaJS.d.I.getClassOf())) || (that === ScalaJS.d.F.getClassOf()))))))) : this.isInstance__O__Z(that.getFakeInstance__p1__O()))
});
ScalaJS.c.jl_Class.prototype.isInstance__O__Z = (function(obj) {
  return ScalaJS.uZ(this.data$1["isInstance"](obj))
});
ScalaJS.c.jl_Class.prototype.getFakeInstance__p1__O = (function() {
  return this.data$1["getFakeInstance"]()
});
ScalaJS.c.jl_Class.prototype.init___jl_ScalaJSClassData = (function(data) {
  this.data$1 = data;
  return this
});
ScalaJS.c.jl_Class.prototype.isArray__Z = (function() {
  return ScalaJS.uZ(this.data$1["isArrayClass"])
});
ScalaJS.c.jl_Class.prototype.isInterface__Z = (function() {
  return ScalaJS.uZ(this.data$1["isInterface"])
});
ScalaJS.d.jl_Class = new ScalaJS.ClassTypeData({
  jl_Class: 0
}, false, "java.lang.Class", {
  jl_Class: 1,
  O: 1
});
ScalaJS.c.jl_Class.prototype.$classData = ScalaJS.d.jl_Class;
/** @constructor */
ScalaJS.c.jl_Double$ = (function() {
  ScalaJS.c.O.call(this);
  this.TYPE$1 = null;
  this.POSITIVE$undINFINITY$1 = 0.0;
  this.NEGATIVE$undINFINITY$1 = 0.0;
  this.NaN$1 = 0.0;
  this.MAX$undVALUE$1 = 0.0;
  this.MIN$undVALUE$1 = 0.0;
  this.MAX$undEXPONENT$1 = 0;
  this.MIN$undEXPONENT$1 = 0;
  this.SIZE$1 = 0;
  this.doubleStrPat$1 = null;
  this.bitmap$0$1 = false
});
ScalaJS.c.jl_Double$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Double$.prototype.constructor = ScalaJS.c.jl_Double$;
/** @constructor */
ScalaJS.h.jl_Double$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Double$.prototype = ScalaJS.c.jl_Double$.prototype;
ScalaJS.c.jl_Double$.prototype.compare__D__D__I = (function(a, b) {
  if ((a !== a)) {
    return ((b !== b) ? 0 : 1)
  } else if ((b !== b)) {
    return (-1)
  } else if ((a === b)) {
    if ((a === 0.0)) {
      var ainf = (1.0 / a);
      return ((ainf === (1.0 / b)) ? 0 : ((ainf < 0) ? (-1) : 1))
    } else {
      return 0
    }
  } else {
    return ((a < b) ? (-1) : 1)
  }
});
ScalaJS.d.jl_Double$ = new ScalaJS.ClassTypeData({
  jl_Double$: 0
}, false, "java.lang.Double$", {
  jl_Double$: 1,
  O: 1
});
ScalaJS.c.jl_Double$.prototype.$classData = ScalaJS.d.jl_Double$;
ScalaJS.n.jl_Double$ = (void 0);
ScalaJS.m.jl_Double$ = (function() {
  if ((!ScalaJS.n.jl_Double$)) {
    ScalaJS.n.jl_Double$ = new ScalaJS.c.jl_Double$().init___()
  };
  return ScalaJS.n.jl_Double$
});
/** @constructor */
ScalaJS.c.jl_Integer$ = (function() {
  ScalaJS.c.O.call(this);
  this.TYPE$1 = null;
  this.MIN$undVALUE$1 = 0;
  this.MAX$undVALUE$1 = 0;
  this.SIZE$1 = 0
});
ScalaJS.c.jl_Integer$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Integer$.prototype.constructor = ScalaJS.c.jl_Integer$;
/** @constructor */
ScalaJS.h.jl_Integer$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Integer$.prototype = ScalaJS.c.jl_Integer$.prototype;
ScalaJS.c.jl_Integer$.prototype.rotateLeft__I__I__I = (function(i, distance) {
  return ((i << distance) | ((i >>> ((-distance) | 0)) | 0))
});
ScalaJS.c.jl_Integer$.prototype.bitCount__I__I = (function(i) {
  var t1 = ((i - (1431655765 & (i >> 1))) | 0);
  var t2 = (((858993459 & t1) + (858993459 & (t1 >> 2))) | 0);
  return (ScalaJS.imul(16843009, (252645135 & ((t2 + (t2 >> 4)) | 0))) >> 24)
});
ScalaJS.c.jl_Integer$.prototype.numberOfLeadingZeros__I__I = (function(i) {
  var x = i;
  x = (x | ((x >>> 1) | 0));
  x = (x | ((x >>> 2) | 0));
  x = (x | ((x >>> 4) | 0));
  x = (x | ((x >>> 8) | 0));
  x = (x | ((x >>> 16) | 0));
  return ((32 - this.bitCount__I__I(x)) | 0)
});
ScalaJS.c.jl_Integer$.prototype.numberOfTrailingZeros__I__I = (function(i) {
  return this.bitCount__I__I((((-1) + (i & ((-i) | 0))) | 0))
});
ScalaJS.d.jl_Integer$ = new ScalaJS.ClassTypeData({
  jl_Integer$: 0
}, false, "java.lang.Integer$", {
  jl_Integer$: 1,
  O: 1
});
ScalaJS.c.jl_Integer$.prototype.$classData = ScalaJS.d.jl_Integer$;
ScalaJS.n.jl_Integer$ = (void 0);
ScalaJS.m.jl_Integer$ = (function() {
  if ((!ScalaJS.n.jl_Integer$)) {
    ScalaJS.n.jl_Integer$ = new ScalaJS.c.jl_Integer$().init___()
  };
  return ScalaJS.n.jl_Integer$
});
/** @constructor */
ScalaJS.c.jl_Number = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.jl_Number.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Number.prototype.constructor = ScalaJS.c.jl_Number;
/** @constructor */
ScalaJS.h.jl_Number = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Number.prototype = ScalaJS.c.jl_Number.prototype;
ScalaJS.is.jl_Number = (function(obj) {
  return (!(!(((obj && obj.$classData) && obj.$classData.ancestors.jl_Number) || ((typeof obj) === "number"))))
});
ScalaJS.as.jl_Number = (function(obj) {
  return ((ScalaJS.is.jl_Number(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Number"))
});
ScalaJS.isArrayOf.jl_Number = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Number)))
});
ScalaJS.asArrayOf.jl_Number = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Number(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Number;", depth))
});
/** @constructor */
ScalaJS.c.jl_System$ = (function() {
  ScalaJS.c.O.call(this);
  this.out$1 = null;
  this.err$1 = null;
  this.in$1 = null;
  this.getHighPrecisionTime$1 = null
});
ScalaJS.c.jl_System$.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_System$.prototype.constructor = ScalaJS.c.jl_System$;
/** @constructor */
ScalaJS.h.jl_System$ = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_System$.prototype = ScalaJS.c.jl_System$.prototype;
ScalaJS.c.jl_System$.prototype.init___ = (function() {
  ScalaJS.n.jl_System$ = this;
  this.out$1 = new ScalaJS.c.jl_JSConsoleBasedPrintStream().init___jl_Boolean(false);
  this.err$1 = new ScalaJS.c.jl_JSConsoleBasedPrintStream().init___jl_Boolean(true);
  this.in$1 = null;
  var x = ScalaJS.g["performance"];
  if (ScalaJS.uZ((!(!x)))) {
    var x$1 = ScalaJS.g["performance"]["now"];
    if (ScalaJS.uZ((!(!x$1)))) {
      var jsx$1 = (function(this$2$1) {
        return (function() {
          return ScalaJS.uD(ScalaJS.g["performance"]["now"]())
        })
      })(this)
    } else {
      var x$2 = ScalaJS.g["performance"]["webkitNow"];
      if (ScalaJS.uZ((!(!x$2)))) {
        var jsx$1 = (function(this$3$1) {
          return (function() {
            return ScalaJS.uD(ScalaJS.g["performance"]["webkitNow"]())
          })
        })(this)
      } else {
        var jsx$1 = (function(this$4$1) {
          return (function() {
            return ScalaJS.uD(new ScalaJS.g["Date"]()["getTime"]())
          })
        })(this)
      }
    }
  } else {
    var jsx$1 = (function(this$5$1) {
      return (function() {
        return ScalaJS.uD(new ScalaJS.g["Date"]()["getTime"]())
      })
    })(this)
  };
  this.getHighPrecisionTime$1 = jsx$1;
  return this
});
ScalaJS.d.jl_System$ = new ScalaJS.ClassTypeData({
  jl_System$: 0
}, false, "java.lang.System$", {
  jl_System$: 1,
  O: 1
});
ScalaJS.c.jl_System$.prototype.$classData = ScalaJS.d.jl_System$;
ScalaJS.n.jl_System$ = (void 0);
ScalaJS.m.jl_System$ = (function() {
  if ((!ScalaJS.n.jl_System$)) {
    ScalaJS.n.jl_System$ = new ScalaJS.c.jl_System$().init___()
  };
  return ScalaJS.n.jl_System$
});
/** @constructor */
ScalaJS.c.jl_ThreadLocal = (function() {
  ScalaJS.c.O.call(this);
  this.hasValue$1 = null;
  this.v$1 = null
});
ScalaJS.c.jl_ThreadLocal.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_ThreadLocal.prototype.constructor = ScalaJS.c.jl_ThreadLocal;
/** @constructor */
ScalaJS.h.jl_ThreadLocal = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_ThreadLocal.prototype = ScalaJS.c.jl_ThreadLocal.prototype;
ScalaJS.c.jl_ThreadLocal.prototype.init___ = (function() {
  this.hasValue$1 = false;
  return this
});
ScalaJS.c.jl_ThreadLocal.prototype.get__O = (function() {
  var x = this.hasValue$1;
  if ((!ScalaJS.uZ(x))) {
    this.set__O__V(this.initialValue__O())
  };
  return this.v$1
});
ScalaJS.c.jl_ThreadLocal.prototype.set__O__V = (function(o) {
  this.v$1 = o;
  this.hasValue$1 = true
});
/** @constructor */
ScalaJS.c.s_DeprecatedConsole = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_DeprecatedConsole.prototype = new ScalaJS.h.O();
ScalaJS.c.s_DeprecatedConsole.prototype.constructor = ScalaJS.c.s_DeprecatedConsole;
/** @constructor */
ScalaJS.h.s_DeprecatedConsole = (function() {
  /*<skip>*/
});
ScalaJS.h.s_DeprecatedConsole.prototype = ScalaJS.c.s_DeprecatedConsole.prototype;
/** @constructor */
ScalaJS.c.s_FallbackArrayBuilding = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_FallbackArrayBuilding.prototype = new ScalaJS.h.O();
ScalaJS.c.s_FallbackArrayBuilding.prototype.constructor = ScalaJS.c.s_FallbackArrayBuilding;
/** @constructor */
ScalaJS.h.s_FallbackArrayBuilding = (function() {
  /*<skip>*/
});
ScalaJS.h.s_FallbackArrayBuilding.prototype = ScalaJS.c.s_FallbackArrayBuilding.prototype;
ScalaJS.s.s_Product2$class__productElement__s_Product2__I__O = (function($$this, n) {
  switch (n) {
    case 0:
      {
        return $$this.$$und1$f;
        break
      };
    case 1:
      {
        return $$this.$$und2$f;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + n));
  }
});
ScalaJS.s.s_Proxy$class__toString__s_Proxy__T = (function($$this) {
  return ("" + $$this.self$1)
});
ScalaJS.s.s_Proxy$class__equals__s_Proxy__O__Z = (function($$this, that) {
  return ((that !== null) && (((that === $$this) || (that === $$this.self$1)) || ScalaJS.objectEquals(that, $$this.self$1)))
});
/** @constructor */
ScalaJS.c.s_math_Ordered$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Ordered$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Ordered$.prototype.constructor = ScalaJS.c.s_math_Ordered$;
/** @constructor */
ScalaJS.h.s_math_Ordered$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Ordered$.prototype = ScalaJS.c.s_math_Ordered$.prototype;
ScalaJS.d.s_math_Ordered$ = new ScalaJS.ClassTypeData({
  s_math_Ordered$: 0
}, false, "scala.math.Ordered$", {
  s_math_Ordered$: 1,
  O: 1
});
ScalaJS.c.s_math_Ordered$.prototype.$classData = ScalaJS.d.s_math_Ordered$;
ScalaJS.n.s_math_Ordered$ = (void 0);
ScalaJS.m.s_math_Ordered$ = (function() {
  if ((!ScalaJS.n.s_math_Ordered$)) {
    ScalaJS.n.s_math_Ordered$ = new ScalaJS.c.s_math_Ordered$().init___()
  };
  return ScalaJS.n.s_math_Ordered$
});
/** @constructor */
ScalaJS.c.s_package$ = (function() {
  ScalaJS.c.O.call(this);
  this.AnyRef$1 = null;
  this.Traversable$1 = null;
  this.Iterable$1 = null;
  this.Seq$1 = null;
  this.IndexedSeq$1 = null;
  this.Iterator$1 = null;
  this.List$1 = null;
  this.Nil$1 = null;
  this.$$colon$colon$1 = null;
  this.$$plus$colon$1 = null;
  this.$$colon$plus$1 = null;
  this.Stream$1 = null;
  this.$$hash$colon$colon$1 = null;
  this.Vector$1 = null;
  this.StringBuilder$1 = null;
  this.Range$1 = null;
  this.BigDecimal$1 = null;
  this.BigInt$1 = null;
  this.Equiv$1 = null;
  this.Fractional$1 = null;
  this.Integral$1 = null;
  this.Numeric$1 = null;
  this.Ordered$1 = null;
  this.Ordering$1 = null;
  this.Either$1 = null;
  this.Left$1 = null;
  this.Right$1 = null;
  this.bitmap$0$1 = 0
});
ScalaJS.c.s_package$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_package$.prototype.constructor = ScalaJS.c.s_package$;
/** @constructor */
ScalaJS.h.s_package$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_package$.prototype = ScalaJS.c.s_package$.prototype;
ScalaJS.c.s_package$.prototype.init___ = (function() {
  ScalaJS.n.s_package$ = this;
  this.AnyRef$1 = new ScalaJS.c.s_package$$anon$1().init___();
  this.Traversable$1 = ScalaJS.m.sc_Traversable$();
  this.Iterable$1 = ScalaJS.m.sc_Iterable$();
  this.Seq$1 = ScalaJS.m.sc_Seq$();
  this.IndexedSeq$1 = ScalaJS.m.sc_IndexedSeq$();
  this.Iterator$1 = ScalaJS.m.sc_Iterator$();
  this.List$1 = ScalaJS.m.sci_List$();
  this.Nil$1 = ScalaJS.m.sci_Nil$();
  this.$$colon$colon$1 = ScalaJS.m.sci_$colon$colon$();
  this.$$plus$colon$1 = ScalaJS.m.sc_$plus$colon$();
  this.$$colon$plus$1 = ScalaJS.m.sc_$colon$plus$();
  this.Stream$1 = ScalaJS.m.sci_Stream$();
  this.$$hash$colon$colon$1 = ScalaJS.m.sci_Stream$$hash$colon$colon$();
  this.Vector$1 = ScalaJS.m.sci_Vector$();
  this.StringBuilder$1 = ScalaJS.m.scm_StringBuilder$();
  this.Range$1 = ScalaJS.m.sci_Range$();
  this.Equiv$1 = ScalaJS.m.s_math_Equiv$();
  this.Fractional$1 = ScalaJS.m.s_math_Fractional$();
  this.Integral$1 = ScalaJS.m.s_math_Integral$();
  this.Numeric$1 = ScalaJS.m.s_math_Numeric$();
  this.Ordered$1 = ScalaJS.m.s_math_Ordered$();
  this.Ordering$1 = ScalaJS.m.s_math_Ordering$();
  this.Either$1 = ScalaJS.m.s_util_Either$();
  this.Left$1 = ScalaJS.m.s_util_Left$();
  this.Right$1 = ScalaJS.m.s_util_Right$();
  return this
});
ScalaJS.d.s_package$ = new ScalaJS.ClassTypeData({
  s_package$: 0
}, false, "scala.package$", {
  s_package$: 1,
  O: 1
});
ScalaJS.c.s_package$.prototype.$classData = ScalaJS.d.s_package$;
ScalaJS.n.s_package$ = (void 0);
ScalaJS.m.s_package$ = (function() {
  if ((!ScalaJS.n.s_package$)) {
    ScalaJS.n.s_package$ = new ScalaJS.c.s_package$().init___()
  };
  return ScalaJS.n.s_package$
});
/** @constructor */
ScalaJS.c.s_util_DynamicVariable = (function() {
  ScalaJS.c.O.call(this);
  this.scala$util$DynamicVariable$$init$f = null;
  this.tl$1 = null
});
ScalaJS.c.s_util_DynamicVariable.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_DynamicVariable.prototype.constructor = ScalaJS.c.s_util_DynamicVariable;
/** @constructor */
ScalaJS.h.s_util_DynamicVariable = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_DynamicVariable.prototype = ScalaJS.c.s_util_DynamicVariable.prototype;
ScalaJS.c.s_util_DynamicVariable.prototype.toString__T = (function() {
  return (("DynamicVariable(" + this.tl$1.get__O()) + ")")
});
ScalaJS.c.s_util_DynamicVariable.prototype.init___O = (function(init) {
  this.scala$util$DynamicVariable$$init$f = init;
  this.tl$1 = new ScalaJS.c.s_util_DynamicVariable$$anon$1().init___s_util_DynamicVariable(this);
  return this
});
ScalaJS.d.s_util_DynamicVariable = new ScalaJS.ClassTypeData({
  s_util_DynamicVariable: 0
}, false, "scala.util.DynamicVariable", {
  s_util_DynamicVariable: 1,
  O: 1
});
ScalaJS.c.s_util_DynamicVariable.prototype.$classData = ScalaJS.d.s_util_DynamicVariable;
/** @constructor */
ScalaJS.c.s_util_Either = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_Either.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_Either.prototype.constructor = ScalaJS.c.s_util_Either;
/** @constructor */
ScalaJS.h.s_util_Either = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Either.prototype = ScalaJS.c.s_util_Either.prototype;
/** @constructor */
ScalaJS.c.s_util_Either$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_Either$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_Either$.prototype.constructor = ScalaJS.c.s_util_Either$;
/** @constructor */
ScalaJS.h.s_util_Either$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Either$.prototype = ScalaJS.c.s_util_Either$.prototype;
ScalaJS.d.s_util_Either$ = new ScalaJS.ClassTypeData({
  s_util_Either$: 0
}, false, "scala.util.Either$", {
  s_util_Either$: 1,
  O: 1
});
ScalaJS.c.s_util_Either$.prototype.$classData = ScalaJS.d.s_util_Either$;
ScalaJS.n.s_util_Either$ = (void 0);
ScalaJS.m.s_util_Either$ = (function() {
  if ((!ScalaJS.n.s_util_Either$)) {
    ScalaJS.n.s_util_Either$ = new ScalaJS.c.s_util_Either$().init___()
  };
  return ScalaJS.n.s_util_Either$
});
/** @constructor */
ScalaJS.c.s_util_control_Breaks = (function() {
  ScalaJS.c.O.call(this);
  this.scala$util$control$Breaks$$breakException$1 = null
});
ScalaJS.c.s_util_control_Breaks.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_control_Breaks.prototype.constructor = ScalaJS.c.s_util_control_Breaks;
/** @constructor */
ScalaJS.h.s_util_control_Breaks = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_control_Breaks.prototype = ScalaJS.c.s_util_control_Breaks.prototype;
ScalaJS.c.s_util_control_Breaks.prototype.init___ = (function() {
  this.scala$util$control$Breaks$$breakException$1 = new ScalaJS.c.s_util_control_BreakControl().init___();
  return this
});
ScalaJS.d.s_util_control_Breaks = new ScalaJS.ClassTypeData({
  s_util_control_Breaks: 0
}, false, "scala.util.control.Breaks", {
  s_util_control_Breaks: 1,
  O: 1
});
ScalaJS.c.s_util_control_Breaks.prototype.$classData = ScalaJS.d.s_util_control_Breaks;
ScalaJS.s.s_util_control_NoStackTrace$class__fillInStackTrace__s_util_control_NoStackTrace__jl_Throwable = (function($$this) {
  var this$1 = ScalaJS.m.s_util_control_NoStackTrace$();
  if (this$1.$$undnoSuppression$1) {
    return $$this.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable()
  } else {
    return ScalaJS.as.jl_Throwable($$this)
  }
});
/** @constructor */
ScalaJS.c.s_util_hashing_MurmurHash3 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.constructor = ScalaJS.c.s_util_hashing_MurmurHash3;
/** @constructor */
ScalaJS.h.s_util_hashing_MurmurHash3 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_hashing_MurmurHash3.prototype = ScalaJS.c.s_util_hashing_MurmurHash3.prototype;
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = ScalaJS.imul((-862048943), k);
  k = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(k, 15);
  k = ScalaJS.imul(461845907, k);
  return (hash ^ k)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  h = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(h, 13);
  return (((-430675100) + ScalaJS.imul(5, h)) | 0)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.avalanche__p1__I__I = (function(hash) {
  var h = hash;
  h = (h ^ ((h >>> 16) | 0));
  h = ScalaJS.imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = ScalaJS.imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.productHash__s_Product__I__I = (function(x, seed) {
  var arr = x.productArity__I();
  if ((arr === 0)) {
    var this$1 = x.productPrefix__T();
    return ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I(this$1)
  } else {
    var h = seed;
    var i = 0;
    while ((i < arr)) {
      h = this.mix__I__I__I(h, ScalaJS.m.sr_ScalaRunTime$().hash__O__I(x.productElement__I__O(i)));
      i = ((1 + i) | 0)
    };
    return this.finalizeHash__I__I__I(h, arr)
  }
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__p1__I__I((hash ^ length))
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.orderedHash__sc_TraversableOnce__I__I = (function(xs, seed) {
  var n = new ScalaJS.c.sr_IntRef().init___I(0);
  var h = new ScalaJS.c.sr_IntRef().init___I(seed);
  xs.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2$1, n$1, h$1) {
    return (function(x$2) {
      h$1.elem$1 = this$2$1.mix__I__I__I(h$1.elem$1, ScalaJS.m.sr_ScalaRunTime$().hash__O__I(x$2));
      n$1.elem$1 = ((1 + n$1.elem$1) | 0)
    })
  })(this, n, h)));
  return this.finalizeHash__I__I__I(h.elem$1, n.elem$1)
});
ScalaJS.c.s_util_hashing_MurmurHash3.prototype.listHash__sci_List__I__I = (function(xs, seed) {
  var n = 0;
  var h = seed;
  var elems = xs;
  while ((!elems.isEmpty__Z())) {
    var head = elems.head__O();
    var this$1 = elems;
    var tail = this$1.tail__sci_List();
    h = this.mix__I__I__I(h, ScalaJS.m.sr_ScalaRunTime$().hash__O__I(head));
    n = ((1 + n) | 0);
    elems = tail
  };
  return this.finalizeHash__I__I__I(h, n)
});
/** @constructor */
ScalaJS.c.sc_$colon$plus$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_$colon$plus$.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_$colon$plus$.prototype.constructor = ScalaJS.c.sc_$colon$plus$;
/** @constructor */
ScalaJS.h.sc_$colon$plus$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_$colon$plus$.prototype = ScalaJS.c.sc_$colon$plus$.prototype;
ScalaJS.d.sc_$colon$plus$ = new ScalaJS.ClassTypeData({
  sc_$colon$plus$: 0
}, false, "scala.collection.$colon$plus$", {
  sc_$colon$plus$: 1,
  O: 1
});
ScalaJS.c.sc_$colon$plus$.prototype.$classData = ScalaJS.d.sc_$colon$plus$;
ScalaJS.n.sc_$colon$plus$ = (void 0);
ScalaJS.m.sc_$colon$plus$ = (function() {
  if ((!ScalaJS.n.sc_$colon$plus$)) {
    ScalaJS.n.sc_$colon$plus$ = new ScalaJS.c.sc_$colon$plus$().init___()
  };
  return ScalaJS.n.sc_$colon$plus$
});
/** @constructor */
ScalaJS.c.sc_$plus$colon$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_$plus$colon$.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_$plus$colon$.prototype.constructor = ScalaJS.c.sc_$plus$colon$;
/** @constructor */
ScalaJS.h.sc_$plus$colon$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_$plus$colon$.prototype = ScalaJS.c.sc_$plus$colon$.prototype;
ScalaJS.d.sc_$plus$colon$ = new ScalaJS.ClassTypeData({
  sc_$plus$colon$: 0
}, false, "scala.collection.$plus$colon$", {
  sc_$plus$colon$: 1,
  O: 1
});
ScalaJS.c.sc_$plus$colon$.prototype.$classData = ScalaJS.d.sc_$plus$colon$;
ScalaJS.n.sc_$plus$colon$ = (void 0);
ScalaJS.m.sc_$plus$colon$ = (function() {
  if ((!ScalaJS.n.sc_$plus$colon$)) {
    ScalaJS.n.sc_$plus$colon$ = new ScalaJS.c.sc_$plus$colon$().init___()
  };
  return ScalaJS.n.sc_$plus$colon$
});
ScalaJS.s.sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z = (function($$this, that) {
  if (ScalaJS.is.sc_GenSeq(that)) {
    var x2 = ScalaJS.as.sc_GenSeq(that);
    return $$this.sameElements__sc_GenIterable__Z(x2)
  } else {
    return false
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I = (function($$this, len) {
  return (($$this.length__I() - len) | 0)
});
ScalaJS.s.sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V = (function($$this, xs, start, len) {
  var i = 0;
  var j = start;
  var $$this$1 = $$this.length__I();
  var $$this$2 = (($$this$1 < len) ? $$this$1 : len);
  var that = ((ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var end = (($$this$2 < that) ? $$this$2 : that);
  while ((i < end)) {
    ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, j, $$this.apply__I__O(i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z = (function($$this, that) {
  if (ScalaJS.is.sc_IndexedSeq(that)) {
    var x2 = ScalaJS.as.sc_IndexedSeq(that);
    var len = $$this.length__I();
    if ((len === x2.length__I())) {
      var i = 0;
      while (((i < len) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z($$this.apply__I__O(i), x2.apply__I__O(i)))) {
        i = ((1 + i) | 0)
      };
      return (i === len)
    } else {
      return false
    }
  } else {
    return ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that)
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V = (function($$this, f) {
  var i = 0;
  var len = $$this.length__I();
  while ((i < len)) {
    f.apply__O__O($$this.apply__I__O(i));
    i = ((1 + i) | 0)
  }
});
ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z = (function($$this) {
  return ($$this.length__I() === 0)
});
ScalaJS.s.sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V = (function($$this, xs, start, len) {
  var i = start;
  var $$this$1 = ((start + len) | 0);
  var that = ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs);
  var end = (($$this$1 < that) ? $$this$1 : that);
  var it = $$this.iterator__sc_Iterator();
  while (((i < end) && it.hasNext__Z())) {
    ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(xs, i, it.next__O());
    i = ((1 + i) | 0)
  }
});
ScalaJS.s.sc_IterableLike$class__take__sc_IterableLike__I__O = (function($$this, n) {
  var b = $$this.newBuilder__scm_Builder();
  if ((n <= 0)) {
    return b.result__O()
  } else {
    b.sizeHintBounded__I__sc_TraversableLike__V(n, $$this);
    var i = 0;
    var it = $$this.iterator__sc_Iterator();
    while (((i < n) && it.hasNext__Z())) {
      b.$$plus$eq__O__scm_Builder(it.next__O());
      i = ((1 + i) | 0)
    };
    return b.result__O()
  }
});
ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z = (function($$this, that) {
  var these = $$this.iterator__sc_Iterator();
  var those = that.iterator__sc_Iterator();
  while ((these.hasNext__Z() && those.hasNext__Z())) {
    if ((!ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(these.next__O(), those.next__O()))) {
      return false
    }
  };
  return ((!these.hasNext__Z()) && (!those.hasNext__Z()))
});
/** @constructor */
ScalaJS.c.sc_Iterator$ = (function() {
  ScalaJS.c.O.call(this);
  this.empty$1 = null
});
ScalaJS.c.sc_Iterator$.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_Iterator$.prototype.constructor = ScalaJS.c.sc_Iterator$;
/** @constructor */
ScalaJS.h.sc_Iterator$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterator$.prototype = ScalaJS.c.sc_Iterator$.prototype;
ScalaJS.c.sc_Iterator$.prototype.init___ = (function() {
  ScalaJS.n.sc_Iterator$ = this;
  this.empty$1 = new ScalaJS.c.sc_Iterator$$anon$2().init___();
  return this
});
ScalaJS.d.sc_Iterator$ = new ScalaJS.ClassTypeData({
  sc_Iterator$: 0
}, false, "scala.collection.Iterator$", {
  sc_Iterator$: 1,
  O: 1
});
ScalaJS.c.sc_Iterator$.prototype.$classData = ScalaJS.d.sc_Iterator$;
ScalaJS.n.sc_Iterator$ = (void 0);
ScalaJS.m.sc_Iterator$ = (function() {
  if ((!ScalaJS.n.sc_Iterator$)) {
    ScalaJS.n.sc_Iterator$ = new ScalaJS.c.sc_Iterator$().init___()
  };
  return ScalaJS.n.sc_Iterator$
});
ScalaJS.s.sc_Iterator$class__toStream__sc_Iterator__sci_Stream = (function($$this) {
  if ($$this.hasNext__Z()) {
    var hd = $$this.next__O();
    var tl = new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function($$this$1) {
      return (function() {
        return $$this$1.toStream__sci_Stream()
      })
    })($$this));
    return new ScalaJS.c.sci_Stream$Cons().init___O__F0(hd, tl)
  } else {
    ScalaJS.m.sci_Stream$();
    return ScalaJS.m.sci_Stream$Empty$()
  }
});
ScalaJS.s.sc_Iterator$class__isEmpty__sc_Iterator__Z = (function($$this) {
  return (!$$this.hasNext__Z())
});
ScalaJS.s.sc_Iterator$class__toString__sc_Iterator__T = (function($$this) {
  return (($$this.hasNext__Z() ? "non-empty" : "empty") + " iterator")
});
ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V = (function($$this, f) {
  while ($$this.hasNext__Z()) {
    f.apply__O__O($$this.next__O())
  }
});
ScalaJS.s.sc_LinearSeqOptimized$class__foreach__sc_LinearSeqOptimized__F1__V = (function($$this, f) {
  var these = $$this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
  }
});
ScalaJS.s.sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I = (function($$this, len) {
  return ((len < 0) ? 1 : ScalaJS.s.sc_LinearSeqOptimized$class__loop$1__p0__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I($$this, 0, $$this, len))
});
ScalaJS.s.sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O = (function($$this, n) {
  var rest = $$this.drop__I__sc_LinearSeqOptimized(n);
  if (((n < 0) || rest.isEmpty__Z())) {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + n))
  };
  return rest.head__O()
});
ScalaJS.s.sc_LinearSeqOptimized$class__loop$1__p0__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized__I__I = (function($$this, i, xs, len$1) {
  _loop: while (true) {
    if ((i === len$1)) {
      return (xs.isEmpty__Z() ? 0 : 1)
    } else if (xs.isEmpty__Z()) {
      return (-1)
    } else {
      var temp$i = ((1 + i) | 0);
      var temp$xs = ScalaJS.as.sc_LinearSeqOptimized(xs.tail__O());
      i = temp$i;
      xs = temp$xs;
      continue _loop
    }
  }
});
ScalaJS.s.sc_LinearSeqOptimized$class__length__sc_LinearSeqOptimized__I = (function($$this) {
  var these = $$this;
  var len = 0;
  while ((!these.isEmpty__Z())) {
    len = ((1 + len) | 0);
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
  };
  return len
});
ScalaJS.s.sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z = (function($$this, that) {
  if (ScalaJS.is.sc_LinearSeq(that)) {
    var x2 = ScalaJS.as.sc_LinearSeq(that);
    if (($$this === x2)) {
      return true
    } else {
      var these = $$this;
      var those = x2;
      while ((((!these.isEmpty__Z()) && (!those.isEmpty__Z())) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(these.head__O(), those.head__O()))) {
        these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O());
        those = ScalaJS.as.sc_LinearSeq(those.tail__O())
      };
      return (these.isEmpty__Z() && those.isEmpty__Z())
    }
  } else {
    return ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z($$this, that)
  }
});
ScalaJS.s.sc_LinearSeqOptimized$class__drop__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized = (function($$this, n) {
  var these = $$this;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O());
    count = (((-1) + count) | 0)
  };
  return these
});
ScalaJS.s.sc_SeqLike$class__isEmpty__sc_SeqLike__Z = (function($$this) {
  return ($$this.lengthCompare__I__I(0) === 0)
});
ScalaJS.s.sc_SeqLike$class__lengthCompare__sc_SeqLike__I__I = (function($$this, len) {
  if ((len < 0)) {
    return 1
  } else {
    var i = 0;
    var it = $$this.iterator__sc_Iterator();
    while (it.hasNext__Z()) {
      if ((i === len)) {
        return (it.hasNext__Z() ? 1 : 0)
      };
      it.next__O();
      i = ((1 + i) | 0)
    };
    return ((i - len) | 0)
  }
});
ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O = (function($$this, cbf) {
  var b = cbf.apply__scm_Builder();
  ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V(b, $$this);
  b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable($$this.thisCollection__sc_Traversable());
  return b.result__O()
});
ScalaJS.s.sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O = (function($$this, f, bf) {
  var b = bf.apply__O__scm_Builder($$this.repr__O());
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, b$1, f$1) {
    return (function(x$2) {
      return ScalaJS.as.scm_Builder(b$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(ScalaJS.as.sc_GenTraversableOnce(f$1.apply__O__O(x$2)).seq__sc_TraversableOnce()))
    })
  })($$this, b, f)));
  return b.result__O()
});
ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T = (function($$this) {
  return $$this.mkString__T__T__T__T(($$this.stringPrefix__T() + "("), ", ", ")")
});
ScalaJS.s.sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T = (function($$this) {
  var string = ScalaJS.objectGetClass($$this.repr__O()).getName__T();
  var idx1 = ScalaJS.m.sjsr_RuntimeString$().lastIndexOf__T__I__I(string, 46);
  if ((idx1 !== (-1))) {
    var thiz = string;
    var beginIndex = ((1 + idx1) | 0);
    string = ScalaJS.as.T(thiz["substring"](beginIndex))
  };
  var idx2 = ScalaJS.m.sjsr_RuntimeString$().indexOf__T__I__I(string, 36);
  if ((idx2 !== (-1))) {
    var thiz$1 = string;
    string = ScalaJS.as.T(thiz$1["substring"](0, idx2))
  };
  return string
});
ScalaJS.is.sc_TraversableOnce = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_TraversableOnce)))
});
ScalaJS.as.sc_TraversableOnce = (function(obj) {
  return ((ScalaJS.is.sc_TraversableOnce(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.TraversableOnce"))
});
ScalaJS.isArrayOf.sc_TraversableOnce = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_TraversableOnce)))
});
ScalaJS.asArrayOf.sc_TraversableOnce = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_TraversableOnce(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.TraversableOnce;", depth))
});
ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder = (function($$this, b, start, sep, end) {
  var first = new ScalaJS.c.sr_BooleanRef().init___Z(true);
  b.append__T__scm_StringBuilder(start);
  $$this.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1, first$1, b$1, sep$1) {
    return (function(x$2) {
      if (first$1.elem$1) {
        b$1.append__O__scm_StringBuilder(x$2);
        first$1.elem$1 = false;
        return (void 0)
      } else {
        b$1.append__T__scm_StringBuilder(sep$1);
        return b$1.append__O__scm_StringBuilder(x$2)
      }
    })
  })($$this, first, b, sep)));
  b.append__T__scm_StringBuilder(end);
  return b
});
ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T = (function($$this, start, sep, end) {
  var this$1 = $$this.addString__scm_StringBuilder__T__T__T__scm_StringBuilder(new ScalaJS.c.scm_StringBuilder().init___(), start, sep, end);
  var this$2 = this$1.underlying$5;
  return this$2.content$1
});
ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z = (function($$this) {
  return (!$$this.isEmpty__Z())
});
/** @constructor */
ScalaJS.c.scg_GenericCompanion = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.scg_GenericCompanion.prototype = new ScalaJS.h.O();
ScalaJS.c.scg_GenericCompanion.prototype.constructor = ScalaJS.c.scg_GenericCompanion;
/** @constructor */
ScalaJS.h.scg_GenericCompanion = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenericCompanion.prototype = ScalaJS.c.scg_GenericCompanion.prototype;
ScalaJS.c.scg_GenericCompanion.prototype.apply__sc_Seq__sc_GenTraversable = (function(elems) {
  if (elems.isEmpty__Z()) {
    return this.empty__sc_GenTraversable()
  } else {
    var b = this.newBuilder__scm_Builder();
    b.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(elems);
    return ScalaJS.as.sc_GenTraversable(b.result__O())
  }
});
ScalaJS.c.scg_GenericCompanion.prototype.empty__sc_GenTraversable = (function() {
  return ScalaJS.as.sc_GenTraversable(this.newBuilder__scm_Builder().result__O())
});
ScalaJS.s.scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V = (function($$this, xs) {
  x: {
    _loop: while (true) {
      var this$1 = xs;
      if (ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
        $$this.$$plus$eq__O__scg_Growable(xs.head__O());
        xs = ScalaJS.as.sc_LinearSeq(xs.tail__O());
        continue _loop
      };
      break x
    }
  }
});
ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable = (function($$this, xs) {
  if (ScalaJS.is.sc_LinearSeq(xs)) {
    var x2 = ScalaJS.as.sc_LinearSeq(xs);
    ScalaJS.s.scg_Growable$class__loop$1__p0__scg_Growable__sc_LinearSeq__V($$this, x2)
  } else {
    xs.foreach__F1__V(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function($$this$1) {
      return (function(elem$2) {
        return $$this$1.$$plus$eq__O__scg_Growable(elem$2)
      })
    })($$this)))
  };
  return $$this
});
/** @constructor */
ScalaJS.c.sci_Stream$$hash$colon$colon$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sci_Stream$$hash$colon$colon$.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_Stream$$hash$colon$colon$.prototype.constructor = ScalaJS.c.sci_Stream$$hash$colon$colon$;
/** @constructor */
ScalaJS.h.sci_Stream$$hash$colon$colon$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$$hash$colon$colon$.prototype = ScalaJS.c.sci_Stream$$hash$colon$colon$.prototype;
ScalaJS.d.sci_Stream$$hash$colon$colon$ = new ScalaJS.ClassTypeData({
  sci_Stream$$hash$colon$colon$: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  sci_Stream$$hash$colon$colon$: 1,
  O: 1
});
ScalaJS.c.sci_Stream$$hash$colon$colon$.prototype.$classData = ScalaJS.d.sci_Stream$$hash$colon$colon$;
ScalaJS.n.sci_Stream$$hash$colon$colon$ = (void 0);
ScalaJS.m.sci_Stream$$hash$colon$colon$ = (function() {
  if ((!ScalaJS.n.sci_Stream$$hash$colon$colon$)) {
    ScalaJS.n.sci_Stream$$hash$colon$colon$ = new ScalaJS.c.sci_Stream$$hash$colon$colon$().init___()
  };
  return ScalaJS.n.sci_Stream$$hash$colon$colon$
});
/** @constructor */
ScalaJS.c.sci_StreamIterator$LazyCell = (function() {
  ScalaJS.c.O.call(this);
  this.st$1 = null;
  this.v$1 = null;
  this.$$outer$f = null;
  this.bitmap$0$1 = false
});
ScalaJS.c.sci_StreamIterator$LazyCell.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.constructor = ScalaJS.c.sci_StreamIterator$LazyCell;
/** @constructor */
ScalaJS.h.sci_StreamIterator$LazyCell = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_StreamIterator$LazyCell.prototype = ScalaJS.c.sci_StreamIterator$LazyCell.prototype;
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.init___sci_StreamIterator__F0 = (function($$outer, st) {
  this.st$1 = st;
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.v$lzycompute__p1__sci_Stream = (function() {
  if ((!this.bitmap$0$1)) {
    this.v$1 = ScalaJS.as.sci_Stream(this.st$1.apply__O());
    this.bitmap$0$1 = true
  };
  this.st$1 = null;
  return this.v$1
});
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.v__sci_Stream = (function() {
  return ((!this.bitmap$0$1) ? this.v$lzycompute__p1__sci_Stream() : this.v$1)
});
ScalaJS.d.sci_StreamIterator$LazyCell = new ScalaJS.ClassTypeData({
  sci_StreamIterator$LazyCell: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  sci_StreamIterator$LazyCell: 1,
  O: 1
});
ScalaJS.c.sci_StreamIterator$LazyCell.prototype.$classData = ScalaJS.d.sci_StreamIterator$LazyCell;
ScalaJS.s.sci_VectorPointer$class__getElem__sci_VectorPointer__I__I__O = (function($$this, index, xor) {
  if ((xor < 32)) {
    return $$this.display0__AO().u[(31 & index)]
  } else if ((xor < 1024)) {
    return ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 32768)) {
    return ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1048576)) {
    return ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 33554432)) {
    return ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O($$this.display4__AO().u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else if ((xor < 1073741824)) {
    return ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O(ScalaJS.asArrayOf.O($$this.display5__AO().u[(31 & (index >> 25))], 1).u[(31 & (index >> 20))], 1).u[(31 & (index >> 15))], 1).u[(31 & (index >> 10))], 1).u[(31 & (index >> 5))], 1).u[(31 & index)]
  } else {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  }
});
ScalaJS.s.sci_VectorPointer$class__gotoNextBlockStartWritable__sci_VectorPointer__I__I__V = (function($$this, index, xor) {
  if ((xor < 1024)) {
    if (($$this.depth__I() === 1)) {
      $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display1__AO().u[0] = $$this.display0__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO()
  } else if ((xor < 32768)) {
    if (($$this.depth__I() === 2)) {
      $$this.display2$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display2__AO().u[0] = $$this.display1__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO()
  } else if ((xor < 1048576)) {
    if (($$this.depth__I() === 3)) {
      $$this.display3$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display3__AO().u[0] = $$this.display2__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO()
  } else if ((xor < 33554432)) {
    if (($$this.depth__I() === 4)) {
      $$this.display4$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display4__AO().u[0] = $$this.display3__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display3$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO()
  } else if ((xor < 1073741824)) {
    if (($$this.depth__I() === 5)) {
      $$this.display5$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
      $$this.display5__AO().u[0] = $$this.display4__AO();
      $$this.depth$und$eq__I__V(((1 + $$this.depth__I()) | 0))
    };
    $$this.display0$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display2$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display3$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display4$und$eq__AO__V(ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]));
    $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
    $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
    $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
    $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
    $$this.display5__AO().u[(31 & (index >> 25))] = $$this.display4__AO()
  } else {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  }
});
ScalaJS.s.sci_VectorPointer$class__stabilize__sci_VectorPointer__I__V = (function($$this, index) {
  var x1 = (((-1) + $$this.depth__I()) | 0);
  switch (x1) {
    case 5:
      {
        var a = $$this.display5__AO();
        $$this.display5$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a));
        var a$1 = $$this.display4__AO();
        $$this.display4$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$1));
        var a$2 = $$this.display3__AO();
        $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$2));
        var a$3 = $$this.display2__AO();
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$3));
        var a$4 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$4));
        $$this.display5__AO().u[(31 & (index >> 25))] = $$this.display4__AO();
        $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
        $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
        $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 4:
      {
        var a$5 = $$this.display4__AO();
        $$this.display4$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$5));
        var a$6 = $$this.display3__AO();
        $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$6));
        var a$7 = $$this.display2__AO();
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$7));
        var a$8 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$8));
        $$this.display4__AO().u[(31 & (index >> 20))] = $$this.display3__AO();
        $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
        $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 3:
      {
        var a$9 = $$this.display3__AO();
        $$this.display3$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$9));
        var a$10 = $$this.display2__AO();
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$10));
        var a$11 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$11));
        $$this.display3__AO().u[(31 & (index >> 15))] = $$this.display2__AO();
        $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 2:
      {
        var a$12 = $$this.display2__AO();
        $$this.display2$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$12));
        var a$13 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$13));
        $$this.display2__AO().u[(31 & (index >> 10))] = $$this.display1__AO();
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 1:
      {
        var a$14 = $$this.display1__AO();
        $$this.display1$und$eq__AO__V(ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO($$this, a$14));
        $$this.display1__AO().u[(31 & (index >> 5))] = $$this.display0__AO();
        break
      };
    case 0:
      break;
    default:
      throw new ScalaJS.c.s_MatchError().init___O(x1);
  }
});
ScalaJS.s.sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V = (function($$this, that, depth) {
  $$this.depth$und$eq__I__V(depth);
  var x1 = (((-1) + depth) | 0);
  switch (x1) {
    case (-1):
      break;
    case 0:
      {
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 1:
      {
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 2:
      {
        $$this.display2$und$eq__AO__V(that.display2__AO());
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 3:
      {
        $$this.display3$und$eq__AO__V(that.display3__AO());
        $$this.display2$und$eq__AO__V(that.display2__AO());
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 4:
      {
        $$this.display4$und$eq__AO__V(that.display4__AO());
        $$this.display3$und$eq__AO__V(that.display3__AO());
        $$this.display2$und$eq__AO__V(that.display2__AO());
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    case 5:
      {
        $$this.display5$und$eq__AO__V(that.display5__AO());
        $$this.display4$und$eq__AO__V(that.display4__AO());
        $$this.display3$und$eq__AO__V(that.display3__AO());
        $$this.display2$und$eq__AO__V(that.display2__AO());
        $$this.display1$und$eq__AO__V(that.display1__AO());
        $$this.display0$und$eq__AO__V(that.display0__AO());
        break
      };
    default:
      throw new ScalaJS.c.s_MatchError().init___O(x1);
  }
});
ScalaJS.s.sci_VectorPointer$class__gotoNextBlockStart__sci_VectorPointer__I__I__V = (function($$this, index, xor) {
  if ((xor < 1024)) {
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
  } else if ((xor < 32768)) {
    $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[0], 1))
  } else if ((xor < 1048576)) {
    $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1));
    $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[0], 1))
  } else if ((xor < 33554432)) {
    $$this.display3$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display4__AO().u[(31 & (index >> 20))], 1));
    $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[0], 1));
    $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[0], 1))
  } else if ((xor < 1073741824)) {
    $$this.display4$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display5__AO().u[(31 & (index >> 25))], 1));
    $$this.display3$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display4__AO().u[0], 1));
    $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[0], 1));
    $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[0], 1));
    $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[0], 1))
  } else {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  }
});
ScalaJS.s.sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V = (function($$this, index, xor) {
  if ((xor >= 32)) {
    if ((xor < 1024)) {
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 32768)) {
      $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1048576)) {
      $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 33554432)) {
      $$this.display3$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display4__AO().u[(31 & (index >> 20))], 1));
      $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else if ((xor < 1073741824)) {
      $$this.display4$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display5__AO().u[(31 & (index >> 25))], 1));
      $$this.display3$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display4__AO().u[(31 & (index >> 20))], 1));
      $$this.display2$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display3__AO().u[(31 & (index >> 15))], 1));
      $$this.display1$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display2__AO().u[(31 & (index >> 10))], 1));
      $$this.display0$und$eq__AO__V(ScalaJS.asArrayOf.O($$this.display1__AO().u[(31 & (index >> 5))], 1))
    } else {
      throw new ScalaJS.c.jl_IllegalArgumentException().init___()
    }
  }
});
ScalaJS.s.sci_VectorPointer$class__copyOf__sci_VectorPointer__AO__AO = (function($$this, a) {
  if ((a === null)) {
    var this$2 = ScalaJS.m.s_Console$();
    var this$3 = this$2.outVar$2;
    ScalaJS.as.Ljava_io_PrintStream(this$3.tl$1.get__O()).println__O__V("NULL")
  };
  var b = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [a.u["length"]]);
  var length = a.u["length"];
  ScalaJS.systemArraycopy(a, 0, b, 0, length);
  return b
});
ScalaJS.s.scm_Builder$class__sizeHint__scm_Builder__sc_TraversableLike__V = (function($$this, coll) {
  if (ScalaJS.is.sc_IndexedSeqLike(coll)) {
    $$this.sizeHint__I__V(coll.size__I())
  }
});
ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V = (function($$this, size, boundingColl) {
  if (ScalaJS.is.sc_IndexedSeqLike(boundingColl)) {
    var that = boundingColl.size__I();
    $$this.sizeHint__I__V(((size < that) ? size : that))
  }
});
ScalaJS.s.scm_LinkedListLike$class__isEmpty__scm_LinkedListLike__Z = (function($$this) {
  return ($$this.next$5 === $$this)
});
ScalaJS.s.scm_LinkedListLike$class__apply__scm_LinkedListLike__I__O = (function($$this, n) {
  var loc = ScalaJS.s.scm_LinkedListLike$class__drop__scm_LinkedListLike__I__scm_Seq($$this, n);
  if (loc.nonEmpty__Z()) {
    return ScalaJS.as.scm_LinkedListLike(loc).elem$5
  } else {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + n))
  }
});
ScalaJS.s.scm_LinkedListLike$class__length0__p0__scm_LinkedListLike__scm_Seq__I__I = (function($$this, elem, acc) {
  _length0: while (true) {
    var this$1 = ScalaJS.as.scm_LinkedListLike(elem);
    if (ScalaJS.s.scm_LinkedListLike$class__isEmpty__scm_LinkedListLike__Z(this$1)) {
      return acc
    } else {
      var temp$elem = ScalaJS.as.scm_LinkedListLike(elem).next$5;
      var temp$acc = ((1 + acc) | 0);
      elem = temp$elem;
      acc = temp$acc;
      continue _length0
    }
  }
});
ScalaJS.s.scm_LinkedListLike$class__tail__scm_LinkedListLike__scm_Seq = (function($$this) {
  var requirement = ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z($$this);
  if ((!requirement)) {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___T(("requirement failed: " + "tail of empty list"))
  };
  return $$this.next$5
});
ScalaJS.s.scm_LinkedListLike$class__drop__scm_LinkedListLike__I__scm_Seq = (function($$this, n) {
  var i = 0;
  var these = ScalaJS.as.scm_Seq($$this);
  while (true) {
    if ((i < n)) {
      var this$1 = ScalaJS.as.scm_LinkedListLike(these);
      var jsx$1 = (!ScalaJS.s.scm_LinkedListLike$class__isEmpty__scm_LinkedListLike__Z(this$1))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      these = ScalaJS.as.scm_LinkedListLike(these).next$5;
      i = ((1 + i) | 0)
    } else {
      break
    }
  };
  return these
});
ScalaJS.s.scm_LinkedListLike$class__foreach__scm_LinkedListLike__F1__V = (function($$this, f) {
  var these = $$this;
  while (true) {
    var this$1 = these;
    if (ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)) {
      f.apply__O__O(these.elem$5);
      these = ScalaJS.as.scm_LinkedListLike(these.next$5)
    } else {
      break
    }
  }
});
ScalaJS.s.scm_LinkedListLike$class__head__scm_LinkedListLike__O = (function($$this) {
  if (ScalaJS.s.scm_LinkedListLike$class__isEmpty__scm_LinkedListLike__Z($$this)) {
    throw new ScalaJS.c.ju_NoSuchElementException().init___()
  } else {
    return $$this.elem$5
  }
});
ScalaJS.s.scm_ResizableArray$class__copyToArray__scm_ResizableArray__O__I__I__V = (function($$this, xs, start, len) {
  var that = ((ScalaJS.m.sr_ScalaRunTime$().array$undlength__O__I(xs) - start) | 0);
  var $$this$1 = ((len < that) ? len : that);
  var that$1 = $$this.size0$6;
  var len1 = (($$this$1 < that$1) ? $$this$1 : that$1);
  ScalaJS.m.s_Array$().copy__O__I__O__I__I__V($$this.array$6, 0, xs, start, len1)
});
ScalaJS.s.scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V = (function($$this, n) {
  var x = $$this.array$6.u["length"];
  var arrayLength = new ScalaJS.c.sjsr_RuntimeLong().init___I(x);
  if (new ScalaJS.c.sjsr_RuntimeLong().init___I(n).$$greater__sjsr_RuntimeLong__Z(arrayLength)) {
    var newSize = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(2, 0, 0).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(arrayLength);
    while (new ScalaJS.c.sjsr_RuntimeLong().init___I(n).$$greater__sjsr_RuntimeLong__Z(newSize)) {
      newSize = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(2, 0, 0).$$times__sjsr_RuntimeLong__sjsr_RuntimeLong(newSize)
    };
    if (newSize.$$greater__sjsr_RuntimeLong__Z(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 511, 0))) {
      newSize = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 511, 0)
    };
    var newArray = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [newSize.toInt__I()]);
    var src = $$this.array$6;
    var length = $$this.size0$6;
    ScalaJS.systemArraycopy(src, 0, newArray, 0, length);
    $$this.array$6 = newArray
  }
});
ScalaJS.s.scm_ResizableArray$class__foreach__scm_ResizableArray__F1__V = (function($$this, f) {
  var i = 0;
  var top = $$this.size0$6;
  while ((i < top)) {
    f.apply__O__O($$this.array$6.u[i]);
    i = ((1 + i) | 0)
  }
});
ScalaJS.s.scm_ResizableArray$class__apply__scm_ResizableArray__I__O = (function($$this, idx) {
  if ((idx >= $$this.size0$6)) {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + idx))
  };
  return $$this.array$6.u[idx]
});
ScalaJS.s.scm_ResizableArray$class__$$init$__scm_ResizableArray__V = (function($$this) {
  var x = $$this.initialSize$6;
  $$this.array$6 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [((x > 1) ? x : 1)]);
  $$this.size0$6 = 0
});
/** @constructor */
ScalaJS.c.sjsr_Bits$ = (function() {
  ScalaJS.c.O.call(this);
  this.areTypedArraysSupported$1 = false;
  this.arrayBuffer$1 = null;
  this.int32Array$1 = null;
  this.float32Array$1 = null;
  this.float64Array$1 = null;
  this.areTypedArraysBigEndian$1 = false;
  this.highOffset$1 = 0;
  this.lowOffset$1 = 0
});
ScalaJS.c.sjsr_Bits$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_Bits$.prototype.constructor = ScalaJS.c.sjsr_Bits$;
/** @constructor */
ScalaJS.h.sjsr_Bits$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_Bits$.prototype = ScalaJS.c.sjsr_Bits$.prototype;
ScalaJS.c.sjsr_Bits$.prototype.init___ = (function() {
  ScalaJS.n.sjsr_Bits$ = this;
  var x = (((ScalaJS.g["ArrayBuffer"] && ScalaJS.g["Int32Array"]) && ScalaJS.g["Float32Array"]) && ScalaJS.g["Float64Array"]);
  this.areTypedArraysSupported$1 = ScalaJS.uZ((!(!x)));
  this.arrayBuffer$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["ArrayBuffer"](8) : null);
  this.int32Array$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["Int32Array"](this.arrayBuffer$1, 0, 2) : null);
  this.float32Array$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["Float32Array"](this.arrayBuffer$1, 0, 2) : null);
  this.float64Array$1 = (this.areTypedArraysSupported$1 ? new ScalaJS.g["Float64Array"](this.arrayBuffer$1, 0, 1) : null);
  if ((!this.areTypedArraysSupported$1)) {
    var jsx$1 = true
  } else {
    this.int32Array$1[0] = 16909060;
    var jsx$1 = (ScalaJS.uB(new ScalaJS.g["Int8Array"](this.arrayBuffer$1, 0, 8)[0]) === 1)
  };
  this.areTypedArraysBigEndian$1 = jsx$1;
  this.highOffset$1 = (this.areTypedArraysBigEndian$1 ? 0 : 1);
  this.lowOffset$1 = (this.areTypedArraysBigEndian$1 ? 1 : 0);
  return this
});
ScalaJS.c.sjsr_Bits$.prototype.numberHashCode__D__I = (function(value) {
  var iv = (value | 0);
  if (((iv === value) && ((1.0 / value) !== (-Infinity)))) {
    return iv
  } else {
    var this$1 = this.doubleToLongBits__D__J(value);
    return this$1.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(this$1.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I()
  }
});
ScalaJS.c.sjsr_Bits$.prototype.doubleToLongBitsPolyfill__p1__D__J = (function(value) {
  if ((value !== value)) {
    var _3 = ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, 51));
    var x1_$_$$und1$1 = false;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = _3
  } else if (((value === Infinity) || (value === (-Infinity)))) {
    var _1 = (value < 0);
    var x1_$_$$und1$1 = _1;
    var x1_$_$$und2$1 = 2047;
    var x1_$_$$und3$1 = 0.0
  } else if ((value === 0.0)) {
    var _1$1 = ((1 / value) === (-Infinity));
    var x1_$_$$und1$1 = _1$1;
    var x1_$_$$und2$1 = 0;
    var x1_$_$$und3$1 = 0.0
  } else {
    var s = (value < 0);
    var av = (s ? (-value) : value);
    if ((av >= ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, (-1022))))) {
      var twoPowFbits = ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, 52));
      var a = (ScalaJS.uD(ScalaJS.g["Math"]["log"](av)) / 0.6931471805599453);
      var a$1 = (ScalaJS.uD(ScalaJS.g["Math"]["floor"](a)) | 0);
      var e = ((a$1 < 1023) ? a$1 : 1023);
      var b = e;
      var n = ((av / ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, b))) * twoPowFbits);
      var w = ScalaJS.uD(ScalaJS.g["Math"]["floor"](n));
      var f = (n - w);
      var f$1 = ((f < 0.5) ? w : ((f > 0.5) ? (1 + w) : (((w % 2) !== 0) ? (1 + w) : w)));
      if (((f$1 / twoPowFbits) >= 2)) {
        e = ((1 + e) | 0);
        f$1 = 1.0
      };
      if ((e > 1023)) {
        e = 2047;
        f$1 = 0.0
      } else {
        e = ((1023 + e) | 0);
        f$1 = (f$1 - twoPowFbits)
      };
      var _2 = e;
      var _3$1 = f$1;
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = _2;
      var x1_$_$$und3$1 = _3$1
    } else {
      var n$1 = (av / ScalaJS.uD(ScalaJS.g["Math"]["pow"](2.0, (-1074))));
      var w$1 = ScalaJS.uD(ScalaJS.g["Math"]["floor"](n$1));
      var f$2 = (n$1 - w$1);
      var _3$2 = ((f$2 < 0.5) ? w$1 : ((f$2 > 0.5) ? (1 + w$1) : (((w$1 % 2) !== 0) ? (1 + w$1) : w$1)));
      var x1_$_$$und1$1 = s;
      var x1_$_$$und2$1 = 0;
      var x1_$_$$und3$1 = _3$2
    }
  };
  var s$1 = ScalaJS.uZ(x1_$_$$und1$1);
  var e$1 = ScalaJS.uI(x1_$_$$und2$1);
  var f$3 = ScalaJS.uD(x1_$_$$und3$1);
  var x$2_$_$$und1$1 = s$1;
  var x$2_$_$$und2$1 = e$1;
  var x$2_$_$$und3$1 = f$3;
  var s$2 = ScalaJS.uZ(x$2_$_$$und1$1);
  var e$2 = ScalaJS.uI(x$2_$_$$und2$1);
  var f$2$1 = ScalaJS.uD(x$2_$_$$und3$1);
  var hif = ((f$2$1 / 4.294967296E9) | 0);
  var hi = (((s$2 ? (-2147483648) : 0) | (e$2 << 20)) | hif);
  var lo = (f$2$1 | 0);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I(hi).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 1023, 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I(lo)))
});
ScalaJS.c.sjsr_Bits$.prototype.doubleToLongBits__D__J = (function(value) {
  if (this.areTypedArraysSupported$1) {
    this.float64Array$1[0] = value;
    return new ScalaJS.c.sjsr_RuntimeLong().init___I(ScalaJS.uI(this.int32Array$1[this.highOffset$1])).$$less$less__I__sjsr_RuntimeLong(32).$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 1023, 0).$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong(new ScalaJS.c.sjsr_RuntimeLong().init___I(ScalaJS.uI(this.int32Array$1[this.lowOffset$1]))))
  } else {
    return this.doubleToLongBitsPolyfill__p1__D__J(value)
  }
});
ScalaJS.d.sjsr_Bits$ = new ScalaJS.ClassTypeData({
  sjsr_Bits$: 0
}, false, "scala.scalajs.runtime.Bits$", {
  sjsr_Bits$: 1,
  O: 1
});
ScalaJS.c.sjsr_Bits$.prototype.$classData = ScalaJS.d.sjsr_Bits$;
ScalaJS.n.sjsr_Bits$ = (void 0);
ScalaJS.m.sjsr_Bits$ = (function() {
  if ((!ScalaJS.n.sjsr_Bits$)) {
    ScalaJS.n.sjsr_Bits$ = new ScalaJS.c.sjsr_Bits$().init___()
  };
  return ScalaJS.n.sjsr_Bits$
});
/** @constructor */
ScalaJS.c.sjsr_RuntimeString$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sjsr_RuntimeString$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_RuntimeString$.prototype.constructor = ScalaJS.c.sjsr_RuntimeString$;
/** @constructor */
ScalaJS.h.sjsr_RuntimeString$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_RuntimeString$.prototype = ScalaJS.c.sjsr_RuntimeString$.prototype;
ScalaJS.c.sjsr_RuntimeString$.prototype.valueOf__O__T = (function(value) {
  return ((value === null) ? "null" : ScalaJS.objectToString(value))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.lastIndexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return ScalaJS.uI(thiz["lastIndexOf"](str))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.indexOf__T__I__I = (function(thiz, ch) {
  var str = this.fromCodePoint__p1__I__T(ch);
  return ScalaJS.uI(thiz["indexOf"](str))
});
ScalaJS.c.sjsr_RuntimeString$.prototype.fromCodePoint__p1__I__T = (function(codePoint) {
  if ((((-65536) & codePoint) === 0)) {
    var array = [codePoint];
    var x = ScalaJS.g["String"];
    var jsx$4 = x["fromCharCode"];
    matchEnd5: {
      var jsx$3;
      var jsx$3 = array;
      break matchEnd5
    };
    var jsx$2 = []["concat"](jsx$3);
    var jsx$1 = jsx$4["apply"](x, jsx$2);
    return ScalaJS.as.T(jsx$1)
  } else if (((codePoint < 0) || (codePoint > 1114111))) {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___()
  } else {
    var offsetCp = (((-65536) + codePoint) | 0);
    var array$1 = [(55296 | (offsetCp >> 10)), (56320 | (1023 & offsetCp))];
    var x$1 = ScalaJS.g["String"];
    var jsx$8 = x$1["fromCharCode"];
    matchEnd5$1: {
      var jsx$7;
      var jsx$7 = array$1;
      break matchEnd5$1
    };
    var jsx$6 = []["concat"](jsx$7);
    var jsx$5 = jsx$8["apply"](x$1, jsx$6);
    return ScalaJS.as.T(jsx$5)
  }
});
ScalaJS.c.sjsr_RuntimeString$.prototype.hashCode__T__I = (function(thiz) {
  var res = 0;
  var mul = 1;
  var i = (((-1) + ScalaJS.uI(thiz["length"])) | 0);
  while ((i >= 0)) {
    var jsx$1 = res;
    var index = i;
    res = ((jsx$1 + ScalaJS.imul((65535 & ScalaJS.uI(thiz["charCodeAt"](index))), mul)) | 0);
    mul = ScalaJS.imul(31, mul);
    i = (((-1) + i) | 0)
  };
  return res
});
ScalaJS.d.sjsr_RuntimeString$ = new ScalaJS.ClassTypeData({
  sjsr_RuntimeString$: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  sjsr_RuntimeString$: 1,
  O: 1
});
ScalaJS.c.sjsr_RuntimeString$.prototype.$classData = ScalaJS.d.sjsr_RuntimeString$;
ScalaJS.n.sjsr_RuntimeString$ = (void 0);
ScalaJS.m.sjsr_RuntimeString$ = (function() {
  if ((!ScalaJS.n.sjsr_RuntimeString$)) {
    ScalaJS.n.sjsr_RuntimeString$ = new ScalaJS.c.sjsr_RuntimeString$().init___()
  };
  return ScalaJS.n.sjsr_RuntimeString$
});
/** @constructor */
ScalaJS.c.sjsr_StackTrace$ = (function() {
  ScalaJS.c.O.call(this);
  this.isRhino$1 = false;
  this.decompressedClasses$1 = null;
  this.decompressedPrefixes$1 = null;
  this.compressedPrefixes$1 = null;
  this.bitmap$0$1 = false
});
ScalaJS.c.sjsr_StackTrace$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_StackTrace$.prototype.constructor = ScalaJS.c.sjsr_StackTrace$;
/** @constructor */
ScalaJS.h.sjsr_StackTrace$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_StackTrace$.prototype = ScalaJS.c.sjsr_StackTrace$.prototype;
ScalaJS.c.sjsr_StackTrace$.prototype.init___ = (function() {
  ScalaJS.n.sjsr_StackTrace$ = this;
  var dict = {
    "O": "java_lang_Object",
    "T": "java_lang_String",
    "V": "scala_Unit",
    "Z": "scala_Boolean",
    "C": "scala_Char",
    "B": "scala_Byte",
    "S": "scala_Short",
    "I": "scala_Int",
    "J": "scala_Long",
    "F": "scala_Float",
    "D": "scala_Double"
  };
  var index = 0;
  while ((index <= 22)) {
    if ((index >= 2)) {
      dict[("T" + index)] = ("scala_Tuple" + index)
    };
    dict[("F" + index)] = ("scala_Function" + index);
    index = ((1 + index) | 0)
  };
  this.decompressedClasses$1 = dict;
  this.decompressedPrefixes$1 = {
    "sjsr_": "scala_scalajs_runtime_",
    "sjs_": "scala_scalajs_",
    "sci_": "scala_collection_immutable_",
    "scm_": "scala_collection_mutable_",
    "scg_": "scala_collection_generic_",
    "sc_": "scala_collection_",
    "sr_": "scala_runtime_",
    "s_": "scala_",
    "jl_": "java_lang_",
    "ju_": "java_util_"
  };
  this.compressedPrefixes$1 = ScalaJS.g["Object"]["keys"](this.decompressedPrefixes$1);
  return this
});
ScalaJS.c.sjsr_StackTrace$.prototype.createException__p1__O = (function() {
  try {
    return this["undef"]()
  } catch (e) {
    var e$2 = ScalaJS.m.sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      if (ScalaJS.is.sjs_js_JavaScriptException(e$2)) {
        var x5 = ScalaJS.as.sjs_js_JavaScriptException(e$2);
        var e$3 = x5.exception$4;
        return e$3
      } else {
        throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(e$2)
      }
    } else {
      throw e
    }
  }
});
ScalaJS.c.sjsr_StackTrace$.prototype.captureState__jl_Throwable__O__V = (function(throwable, e) {
  throwable["stackdata"] = e
});
ScalaJS.d.sjsr_StackTrace$ = new ScalaJS.ClassTypeData({
  sjsr_StackTrace$: 0
}, false, "scala.scalajs.runtime.StackTrace$", {
  sjsr_StackTrace$: 1,
  O: 1
});
ScalaJS.c.sjsr_StackTrace$.prototype.$classData = ScalaJS.d.sjsr_StackTrace$;
ScalaJS.n.sjsr_StackTrace$ = (void 0);
ScalaJS.m.sjsr_StackTrace$ = (function() {
  if ((!ScalaJS.n.sjsr_StackTrace$)) {
    ScalaJS.n.sjsr_StackTrace$ = new ScalaJS.c.sjsr_StackTrace$().init___()
  };
  return ScalaJS.n.sjsr_StackTrace$
});
/** @constructor */
ScalaJS.c.sjsr_package$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sjsr_package$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_package$.prototype.constructor = ScalaJS.c.sjsr_package$;
/** @constructor */
ScalaJS.h.sjsr_package$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_package$.prototype = ScalaJS.c.sjsr_package$.prototype;
ScalaJS.c.sjsr_package$.prototype.unwrapJavaScriptException__jl_Throwable__O = (function(th) {
  if (ScalaJS.is.sjs_js_JavaScriptException(th)) {
    var x2 = ScalaJS.as.sjs_js_JavaScriptException(th);
    var e = x2.exception$4;
    return e
  } else {
    return th
  }
});
ScalaJS.c.sjsr_package$.prototype.wrapJavaScriptException__O__jl_Throwable = (function(e) {
  if (ScalaJS.is.jl_Throwable(e)) {
    var x2 = ScalaJS.as.jl_Throwable(e);
    return x2
  } else {
    return new ScalaJS.c.sjs_js_JavaScriptException().init___O(e)
  }
});
ScalaJS.d.sjsr_package$ = new ScalaJS.ClassTypeData({
  sjsr_package$: 0
}, false, "scala.scalajs.runtime.package$", {
  sjsr_package$: 1,
  O: 1
});
ScalaJS.c.sjsr_package$.prototype.$classData = ScalaJS.d.sjsr_package$;
ScalaJS.n.sjsr_package$ = (void 0);
ScalaJS.m.sjsr_package$ = (function() {
  if ((!ScalaJS.n.sjsr_package$)) {
    ScalaJS.n.sjsr_package$ = new ScalaJS.c.sjsr_package$().init___()
  };
  return ScalaJS.n.sjsr_package$
});
ScalaJS.isArrayOf.sr_BoxedUnit = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sr_BoxedUnit)))
});
ScalaJS.asArrayOf.sr_BoxedUnit = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sr_BoxedUnit(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.runtime.BoxedUnit;", depth))
});
ScalaJS.d.sr_BoxedUnit = new ScalaJS.ClassTypeData({
  sr_BoxedUnit: 0
}, false, "scala.runtime.BoxedUnit", {
  sr_BoxedUnit: 1,
  O: 1
}, (void 0), (function(x) {
  return (x === (void 0))
}));
/** @constructor */
ScalaJS.c.sr_BoxesRunTime$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_BoxesRunTime$.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_BoxesRunTime$.prototype.constructor = ScalaJS.c.sr_BoxesRunTime$;
/** @constructor */
ScalaJS.h.sr_BoxesRunTime$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_BoxesRunTime$.prototype = ScalaJS.c.sr_BoxesRunTime$.prototype;
ScalaJS.c.sr_BoxesRunTime$.prototype.equalsCharObject__jl_Character__O__Z = (function(xc, y) {
  if (ScalaJS.is.jl_Character(y)) {
    var x2 = ScalaJS.as.jl_Character(y);
    return (xc.value$1 === x2.value$1)
  } else if (ScalaJS.is.jl_Number(y)) {
    var x3 = ScalaJS.as.jl_Number(y);
    if (((typeof x3) === "number")) {
      var x2$1 = ScalaJS.uD(x3);
      return (x2$1 === xc.value$1)
    } else if (ScalaJS.is.sjsr_RuntimeLong(x3)) {
      var x3$1 = ScalaJS.uJ(x3);
      return x3$1.equals__sjsr_RuntimeLong__Z(new ScalaJS.c.sjsr_RuntimeLong().init___I(xc.value$1))
    } else {
      return ((x3 === null) ? (xc === null) : ScalaJS.objectEquals(x3, xc))
    }
  } else {
    return ((xc === null) && (y === null))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.equalsNumObject__jl_Number__O__Z = (function(xn, y) {
  if (ScalaJS.is.jl_Number(y)) {
    var x2 = ScalaJS.as.jl_Number(y);
    return this.equalsNumNum__jl_Number__jl_Number__Z(xn, x2)
  } else if (ScalaJS.is.jl_Character(y)) {
    var x3 = ScalaJS.as.jl_Character(y);
    if (((typeof xn) === "number")) {
      var x2$1 = ScalaJS.uD(xn);
      return (x2$1 === x3.value$1)
    } else if (ScalaJS.is.sjsr_RuntimeLong(xn)) {
      var x3$1 = ScalaJS.uJ(xn);
      return x3$1.equals__sjsr_RuntimeLong__Z(new ScalaJS.c.sjsr_RuntimeLong().init___I(x3.value$1))
    } else {
      return ((xn === null) ? (x3 === null) : ScalaJS.objectEquals(xn, x3))
    }
  } else {
    return ((xn === null) ? (y === null) : ScalaJS.objectEquals(xn, y))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.equals__O__O__Z = (function(x, y) {
  if ((x === y)) {
    return true
  } else if (ScalaJS.is.jl_Number(x)) {
    var x2 = ScalaJS.as.jl_Number(x);
    return this.equalsNumObject__jl_Number__O__Z(x2, y)
  } else if (ScalaJS.is.jl_Character(x)) {
    var x3 = ScalaJS.as.jl_Character(x);
    return this.equalsCharObject__jl_Character__O__Z(x3, y)
  } else {
    return ((x === null) ? (y === null) : ScalaJS.objectEquals(x, y))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.hashFromLong__jl_Long__I = (function(n) {
  var iv = ScalaJS.uJ(n).toInt__I();
  return (new ScalaJS.c.sjsr_RuntimeLong().init___I(iv).equals__sjsr_RuntimeLong__Z(ScalaJS.uJ(n)) ? iv : ScalaJS.uJ(n).$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(ScalaJS.uJ(n).$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I())
});
ScalaJS.c.sr_BoxesRunTime$.prototype.hashFromNumber__jl_Number__I = (function(n) {
  if (ScalaJS.isInt(n)) {
    var x2 = ScalaJS.uI(n);
    return x2
  } else if (ScalaJS.is.sjsr_RuntimeLong(n)) {
    var x3 = ScalaJS.as.sjsr_RuntimeLong(n);
    return this.hashFromLong__jl_Long__I(x3)
  } else if (((typeof n) === "number")) {
    var x4 = ScalaJS.asDouble(n);
    return this.hashFromDouble__jl_Double__I(x4)
  } else {
    return ScalaJS.objectHashCode(n)
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.equalsNumNum__jl_Number__jl_Number__Z = (function(xn, yn) {
  if (((typeof xn) === "number")) {
    var x2 = ScalaJS.uD(xn);
    if (((typeof yn) === "number")) {
      var x2$2 = ScalaJS.uD(yn);
      return (x2 === x2$2)
    } else if (ScalaJS.is.sjsr_RuntimeLong(yn)) {
      var x3 = ScalaJS.uJ(yn);
      return (x2 === x3.toDouble__D())
    } else if (ScalaJS.is.s_math_ScalaNumber(yn)) {
      var x4 = ScalaJS.as.s_math_ScalaNumber(yn);
      return x4.equals__O__Z(x2)
    } else {
      return false
    }
  } else if (ScalaJS.is.sjsr_RuntimeLong(xn)) {
    var x3$2 = ScalaJS.uJ(xn);
    if (ScalaJS.is.sjsr_RuntimeLong(yn)) {
      var x2$3 = ScalaJS.uJ(yn);
      return x3$2.equals__sjsr_RuntimeLong__Z(x2$3)
    } else if (((typeof yn) === "number")) {
      var x3$3 = ScalaJS.uD(yn);
      return (x3$2.toDouble__D() === x3$3)
    } else if (ScalaJS.is.s_math_ScalaNumber(yn)) {
      var x4$2 = ScalaJS.as.s_math_ScalaNumber(yn);
      return x4$2.equals__O__Z(x3$2)
    } else {
      return false
    }
  } else {
    return ((xn === null) ? (yn === null) : ScalaJS.objectEquals(xn, yn))
  }
});
ScalaJS.c.sr_BoxesRunTime$.prototype.hashFromDouble__jl_Double__I = (function(n) {
  var iv = (ScalaJS.uD(n) | 0);
  var dv = ScalaJS.uD(n);
  if ((iv === dv)) {
    return iv
  } else {
    var lv = ScalaJS.m.sjsr_RuntimeLong$().fromDouble__D__sjsr_RuntimeLong(ScalaJS.uD(n));
    return ((lv.toDouble__D() === dv) ? lv.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(lv.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I() : ScalaJS.m.sjsr_Bits$().numberHashCode__D__I(ScalaJS.uD(n)))
  }
});
ScalaJS.d.sr_BoxesRunTime$ = new ScalaJS.ClassTypeData({
  sr_BoxesRunTime$: 0
}, false, "scala.runtime.BoxesRunTime$", {
  sr_BoxesRunTime$: 1,
  O: 1
});
ScalaJS.c.sr_BoxesRunTime$.prototype.$classData = ScalaJS.d.sr_BoxesRunTime$;
ScalaJS.n.sr_BoxesRunTime$ = (void 0);
ScalaJS.m.sr_BoxesRunTime$ = (function() {
  if ((!ScalaJS.n.sr_BoxesRunTime$)) {
    ScalaJS.n.sr_BoxesRunTime$ = new ScalaJS.c.sr_BoxesRunTime$().init___()
  };
  return ScalaJS.n.sr_BoxesRunTime$
});
/** @constructor */
ScalaJS.c.sr_ScalaRunTime$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_ScalaRunTime$.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_ScalaRunTime$.prototype.constructor = ScalaJS.c.sr_ScalaRunTime$;
/** @constructor */
ScalaJS.h.sr_ScalaRunTime$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_ScalaRunTime$.prototype = ScalaJS.c.sr_ScalaRunTime$.prototype;
ScalaJS.c.sr_ScalaRunTime$.prototype.array$undlength__O__I = (function(xs) {
  if (ScalaJS.isArrayOf.O(xs, 1)) {
    var x2 = ScalaJS.asArrayOf.O(xs, 1);
    return x2.u["length"]
  } else if (ScalaJS.isArrayOf.I(xs, 1)) {
    var x3 = ScalaJS.asArrayOf.I(xs, 1);
    return x3.u["length"]
  } else if (ScalaJS.isArrayOf.D(xs, 1)) {
    var x4 = ScalaJS.asArrayOf.D(xs, 1);
    return x4.u["length"]
  } else if (ScalaJS.isArrayOf.J(xs, 1)) {
    var x5 = ScalaJS.asArrayOf.J(xs, 1);
    return x5.u["length"]
  } else if (ScalaJS.isArrayOf.F(xs, 1)) {
    var x6 = ScalaJS.asArrayOf.F(xs, 1);
    return x6.u["length"]
  } else if (ScalaJS.isArrayOf.C(xs, 1)) {
    var x7 = ScalaJS.asArrayOf.C(xs, 1);
    return x7.u["length"]
  } else if (ScalaJS.isArrayOf.B(xs, 1)) {
    var x8 = ScalaJS.asArrayOf.B(xs, 1);
    return x8.u["length"]
  } else if (ScalaJS.isArrayOf.S(xs, 1)) {
    var x9 = ScalaJS.asArrayOf.S(xs, 1);
    return x9.u["length"]
  } else if (ScalaJS.isArrayOf.Z(xs, 1)) {
    var x10 = ScalaJS.asArrayOf.Z(xs, 1);
    return x10.u["length"]
  } else if (ScalaJS.isArrayOf.sr_BoxedUnit(xs, 1)) {
    var x11 = ScalaJS.asArrayOf.sr_BoxedUnit(xs, 1);
    return x11.u["length"]
  } else if ((xs === null)) {
    throw new ScalaJS.c.jl_NullPointerException().init___()
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(xs)
  }
});
ScalaJS.c.sr_ScalaRunTime$.prototype.array$undupdate__O__I__O__V = (function(xs, idx, value) {
  if (ScalaJS.isArrayOf.O(xs, 1)) {
    var x2 = ScalaJS.asArrayOf.O(xs, 1);
    x2.u[idx] = value
  } else if (ScalaJS.isArrayOf.I(xs, 1)) {
    var x3 = ScalaJS.asArrayOf.I(xs, 1);
    x3.u[idx] = ScalaJS.uI(value)
  } else if (ScalaJS.isArrayOf.D(xs, 1)) {
    var x4 = ScalaJS.asArrayOf.D(xs, 1);
    x4.u[idx] = ScalaJS.uD(value)
  } else if (ScalaJS.isArrayOf.J(xs, 1)) {
    var x5 = ScalaJS.asArrayOf.J(xs, 1);
    x5.u[idx] = ScalaJS.uJ(value)
  } else if (ScalaJS.isArrayOf.F(xs, 1)) {
    var x6 = ScalaJS.asArrayOf.F(xs, 1);
    x6.u[idx] = ScalaJS.uF(value)
  } else if (ScalaJS.isArrayOf.C(xs, 1)) {
    var x7 = ScalaJS.asArrayOf.C(xs, 1);
    if ((value === null)) {
      var jsx$1 = 0
    } else {
      var this$2 = ScalaJS.as.jl_Character(value);
      var jsx$1 = this$2.value$1
    };
    x7.u[idx] = jsx$1
  } else if (ScalaJS.isArrayOf.B(xs, 1)) {
    var x8 = ScalaJS.asArrayOf.B(xs, 1);
    x8.u[idx] = ScalaJS.uB(value)
  } else if (ScalaJS.isArrayOf.S(xs, 1)) {
    var x9 = ScalaJS.asArrayOf.S(xs, 1);
    x9.u[idx] = ScalaJS.uS(value)
  } else if (ScalaJS.isArrayOf.Z(xs, 1)) {
    var x10 = ScalaJS.asArrayOf.Z(xs, 1);
    x10.u[idx] = ScalaJS.uZ(value)
  } else if (ScalaJS.isArrayOf.sr_BoxedUnit(xs, 1)) {
    var x11 = ScalaJS.asArrayOf.sr_BoxedUnit(xs, 1);
    x11.u[idx] = ScalaJS.asUnit(value)
  } else if ((xs === null)) {
    throw new ScalaJS.c.jl_NullPointerException().init___()
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(xs)
  }
});
ScalaJS.c.sr_ScalaRunTime$.prototype.hash__O__I = (function(x) {
  return ((x === null) ? 0 : (ScalaJS.is.jl_Number(x) ? ScalaJS.m.sr_BoxesRunTime$().hashFromNumber__jl_Number__I(ScalaJS.as.jl_Number(x)) : ScalaJS.objectHashCode(x)))
});
ScalaJS.c.sr_ScalaRunTime$.prototype.$$undtoString__s_Product__T = (function(x) {
  var this$1 = x.productIterator__sc_Iterator();
  var start = (x.productPrefix__T() + "(");
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, start, ",", ")")
});
ScalaJS.c.sr_ScalaRunTime$.prototype.array$undapply__O__I__O = (function(xs, idx) {
  if (ScalaJS.isArrayOf.O(xs, 1)) {
    var x2 = ScalaJS.asArrayOf.O(xs, 1);
    return x2.u[idx]
  } else if (ScalaJS.isArrayOf.I(xs, 1)) {
    var x3 = ScalaJS.asArrayOf.I(xs, 1);
    return x3.u[idx]
  } else if (ScalaJS.isArrayOf.D(xs, 1)) {
    var x4 = ScalaJS.asArrayOf.D(xs, 1);
    return x4.u[idx]
  } else if (ScalaJS.isArrayOf.J(xs, 1)) {
    var x5 = ScalaJS.asArrayOf.J(xs, 1);
    return x5.u[idx]
  } else if (ScalaJS.isArrayOf.F(xs, 1)) {
    var x6 = ScalaJS.asArrayOf.F(xs, 1);
    return x6.u[idx]
  } else if (ScalaJS.isArrayOf.C(xs, 1)) {
    var x7 = ScalaJS.asArrayOf.C(xs, 1);
    var c = x7.u[idx];
    return new ScalaJS.c.jl_Character().init___C(c)
  } else if (ScalaJS.isArrayOf.B(xs, 1)) {
    var x8 = ScalaJS.asArrayOf.B(xs, 1);
    return x8.u[idx]
  } else if (ScalaJS.isArrayOf.S(xs, 1)) {
    var x9 = ScalaJS.asArrayOf.S(xs, 1);
    return x9.u[idx]
  } else if (ScalaJS.isArrayOf.Z(xs, 1)) {
    var x10 = ScalaJS.asArrayOf.Z(xs, 1);
    return x10.u[idx]
  } else if (ScalaJS.isArrayOf.sr_BoxedUnit(xs, 1)) {
    var x11 = ScalaJS.asArrayOf.sr_BoxedUnit(xs, 1);
    return x11.u[idx]
  } else if ((xs === null)) {
    throw new ScalaJS.c.jl_NullPointerException().init___()
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(xs)
  }
});
ScalaJS.d.sr_ScalaRunTime$ = new ScalaJS.ClassTypeData({
  sr_ScalaRunTime$: 0
}, false, "scala.runtime.ScalaRunTime$", {
  sr_ScalaRunTime$: 1,
  O: 1
});
ScalaJS.c.sr_ScalaRunTime$.prototype.$classData = ScalaJS.d.sr_ScalaRunTime$;
ScalaJS.n.sr_ScalaRunTime$ = (void 0);
ScalaJS.m.sr_ScalaRunTime$ = (function() {
  if ((!ScalaJS.n.sr_ScalaRunTime$)) {
    ScalaJS.n.sr_ScalaRunTime$ = new ScalaJS.c.sr_ScalaRunTime$().init___()
  };
  return ScalaJS.n.sr_ScalaRunTime$
});
/** @constructor */
ScalaJS.c.sr_Statics$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_Statics$.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_Statics$.prototype.constructor = ScalaJS.c.sr_Statics$;
/** @constructor */
ScalaJS.h.sr_Statics$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_Statics$.prototype = ScalaJS.c.sr_Statics$.prototype;
ScalaJS.c.sr_Statics$.prototype.mixLast__I__I__I = (function(hash, data) {
  var k = data;
  k = ScalaJS.imul((-862048943), k);
  k = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(k, 15);
  k = ScalaJS.imul(461845907, k);
  return (hash ^ k)
});
ScalaJS.c.sr_Statics$.prototype.avalanche__I__I = (function(h0) {
  var h = h0;
  h = (h ^ ((h >>> 16) | 0));
  h = ScalaJS.imul((-2048144789), h);
  h = (h ^ ((h >>> 13) | 0));
  h = ScalaJS.imul((-1028477387), h);
  h = (h ^ ((h >>> 16) | 0));
  return h
});
ScalaJS.c.sr_Statics$.prototype.mix__I__I__I = (function(hash, data) {
  var h = this.mixLast__I__I__I(hash, data);
  h = ScalaJS.m.jl_Integer$().rotateLeft__I__I__I(h, 13);
  return (((-430675100) + ScalaJS.imul(5, h)) | 0)
});
ScalaJS.c.sr_Statics$.prototype.finalizeHash__I__I__I = (function(hash, length) {
  return this.avalanche__I__I((hash ^ length))
});
ScalaJS.d.sr_Statics$ = new ScalaJS.ClassTypeData({
  sr_Statics$: 0
}, false, "scala.runtime.Statics$", {
  sr_Statics$: 1,
  O: 1
});
ScalaJS.c.sr_Statics$.prototype.$classData = ScalaJS.d.sr_Statics$;
ScalaJS.n.sr_Statics$ = (void 0);
ScalaJS.m.sr_Statics$ = (function() {
  if ((!ScalaJS.n.sr_Statics$)) {
    ScalaJS.n.sr_Statics$ = new ScalaJS.c.sr_Statics$().init___()
  };
  return ScalaJS.n.sr_Statics$
});
/** @constructor */
ScalaJS.c.Ljs_webapp_Snake$ = (function() {
  ScalaJS.c.O.call(this);
  this.POINT$undSIZE$1 = 0;
  this.WIDTH$1 = 0;
  this.HEIGHT$1 = 0
});
ScalaJS.c.Ljs_webapp_Snake$.prototype = new ScalaJS.h.O();
ScalaJS.c.Ljs_webapp_Snake$.prototype.constructor = ScalaJS.c.Ljs_webapp_Snake$;
/** @constructor */
ScalaJS.h.Ljs_webapp_Snake$ = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljs_webapp_Snake$.prototype = ScalaJS.c.Ljs_webapp_Snake$.prototype;
ScalaJS.c.Ljs_webapp_Snake$.prototype.init___ = (function() {
  ScalaJS.n.Ljs_webapp_Snake$ = this;
  this.POINT$undSIZE$1 = 5;
  this.WIDTH$1 = 100;
  this.HEIGHT$1 = 100;
  return this
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.drawErr__T__V = (function(err) {
  var parNode = ScalaJS.g["document"]["createElement"]("p");
  var textNode = ScalaJS.g["document"]["createTextNode"](err);
  parNode["appendChild"](textNode);
  ScalaJS.g["document"]["body"]["appendChild"](parNode)
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.start$1__p1__Ljs_webapp_Snake$SnakeModel__F2__sr_IntRef__sr_BooleanRef__V = (function(snakeModel$1, gameField$1, interval$1, started$1) {
  interval$1.elem$1 = ScalaJS.uI(ScalaJS.g["setInterval"]((function(snakeModel$1$1, gameField$1$1, interval$1$1, started$1$1) {
    return (function() {
      ScalaJS.m.Ljs_webapp_Snake$().js$webapp$Snake$$move$1__Ljs_webapp_Snake$SnakeModel__F2__sr_IntRef__sr_BooleanRef__V(snakeModel$1$1, gameField$1$1, interval$1$1, started$1$1)
    })
  })(snakeModel$1, gameField$1, interval$1, started$1), 100.0));
  started$1.elem$1 = true
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.js$webapp$Snake$$draw$1__Ljs_webapp_Snake$Point2__T__I__Lorg_scalajs_dom_raw_CanvasRenderingContext2D__V = (function(point, color, pointSize$1, ctx$1) {
  ctx$1["fillStyle"] = color;
  ctx$1["fillRect"](ScalaJS.imul(point.x$1, pointSize$1), ScalaJS.imul(point.y$1, pointSize$1), pointSize$1, pointSize$1)
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.main__V = (function() {
  var snakeModel = new ScalaJS.c.Ljs_webapp_Snake$SnakeModel().init___I__I(this.WIDTH$1, this.HEIGHT$1);
  var canvas = ScalaJS.g["document"]["createElement"]("canvas");
  var gameField = this.field__I__I__I__Lorg_scalajs_dom_raw_HTMLCanvasElement__F2(this.WIDTH$1, this.HEIGHT$1, this.POINT$undSIZE$1, canvas);
  var interval = new ScalaJS.c.sr_IntRef().init___I(0);
  var started = new ScalaJS.c.sr_BooleanRef().init___Z(false);
  var this$3 = snakeModel.snake$1;
  var these = this$3;
  while ((!these.isEmpty__Z())) {
    var arg1 = these.head__O();
    var p = ScalaJS.as.Ljs_webapp_Snake$Point2(arg1);
    gameField.apply__O__O__O(p, "red");
    these = ScalaJS.as.sc_LinearSeqOptimized(these.tail__O())
  };
  ScalaJS.g["document"]["addEventListener"]("keydown", (function(snakeModel$1, gameField$1, interval$1, started$1) {
    return (function(e$2) {
      ScalaJS.m.Ljs_webapp_Snake$().js$webapp$Snake$$turn$1__Lorg_scalajs_dom_raw_KeyboardEvent__Ljs_webapp_Snake$SnakeModel__F2__sr_IntRef__sr_BooleanRef__V(e$2, snakeModel$1, gameField$1, interval$1, started$1)
    })
  })(snakeModel, gameField, interval, started), false);
  ScalaJS.g["document"]["body"]["appendChild"](canvas)
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.js$webapp$Snake$$turn$1__Lorg_scalajs_dom_raw_KeyboardEvent__Ljs_webapp_Snake$SnakeModel__F2__sr_IntRef__sr_BooleanRef__V = (function(e, snakeModel$1, gameField$1, interval$1, started$1) {
  var x1 = ScalaJS.uI(e["keyCode"]);
  switch (x1) {
    case 37:
      {
        snakeModel$1.left__V();
        break
      };
    case 38:
      {
        snakeModel$1.up__V();
        break
      };
    case 39:
      {
        snakeModel$1.rigth__V();
        break
      };
    case 40:
      {
        snakeModel$1.down__V();
        break
      };
    case 32:
      {
        if (started$1.elem$1) {
          this.stop$1__p1__sr_IntRef__sr_BooleanRef__V(interval$1, started$1)
        } else {
          this.start$1__p1__Ljs_webapp_Snake$SnakeModel__F2__sr_IntRef__sr_BooleanRef__V(snakeModel$1, gameField$1, interval$1, started$1)
        };
        break
      };
    default:
      throw new ScalaJS.c.s_MatchError().init___O(x1);
  }
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.js$webapp$Snake$$move$1__Ljs_webapp_Snake$SnakeModel__F2__sr_IntRef__sr_BooleanRef__V = (function(snakeModel$1, gameField$1, interval$1, started$1) {
  var x1 = snakeModel$1.move__s_util_Either();
  if (ScalaJS.is.s_util_Left(x1)) {
    var x2 = ScalaJS.as.s_util_Left(x1);
    var err = ScalaJS.as.T(x2.a$2);
    this.drawErr__T__V(err);
    this.stop$1__p1__sr_IntRef__sr_BooleanRef__V(interval$1, started$1)
  } else if (ScalaJS.is.s_util_Right(x1)) {
    var x3 = ScalaJS.as.s_util_Right(x1);
    var points = ScalaJS.as.sci_List(x3.b$2);
    var this$2 = ScalaJS.m.s_Console$();
    var this$3 = this$2.outVar$2;
    ScalaJS.as.Ljava_io_PrintStream(this$3.tl$1.get__O()).println__O__V(points);
    var these = points;
    while ((!these.isEmpty__Z())) {
      var arg1 = these.head__O();
      var x0$1 = ScalaJS.as.T2(arg1);
      matchEnd7: {
        if ((x0$1 !== null)) {
          var p2 = ScalaJS.as.T(x0$1.$$und1$f);
          var p = ScalaJS.as.Ljs_webapp_Snake$Point2(x0$1.$$und2$f);
          if ((p2 === "body")) {
            ScalaJS.asUnit(gameField$1.apply__O__O__O(p, "red"));
            break matchEnd7
          }
        };
        if ((x0$1 !== null)) {
          var p3 = ScalaJS.as.T(x0$1.$$und1$f);
          var p$2 = ScalaJS.as.Ljs_webapp_Snake$Point2(x0$1.$$und2$f);
          if ((p3 === "field")) {
            ScalaJS.asUnit(gameField$1.apply__O__O__O(p$2, "white"));
            break matchEnd7
          }
        };
        throw new ScalaJS.c.s_MatchError().init___O(x0$1)
      };
      var this$4 = these;
      these = this$4.tail__sci_List()
    }
  } else {
    throw new ScalaJS.c.s_MatchError().init___O(x1)
  }
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.stop$1__p1__sr_IntRef__sr_BooleanRef__V = (function(interval$1, started$1) {
  ScalaJS.g["clearInterval"](interval$1.elem$1);
  started$1.elem$1 = false
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.$$js$exported$meth$main__O = (function() {
  this.main__V()
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.field__I__I__I__Lorg_scalajs_dom_raw_HTMLCanvasElement__F2 = (function(width, height, pointSize, canvas) {
  canvas["width"] = ScalaJS.imul(width, pointSize);
  canvas["height"] = ScalaJS.imul(height, pointSize);
  var ctx = canvas["getContext"]("2d");
  return new ScalaJS.c.sjsr_AnonFunction2().init___sjs_js_Function2((function(pointSize$1, ctx$1) {
    return (function(point$2, color$2) {
      var point = ScalaJS.as.Ljs_webapp_Snake$Point2(point$2);
      var color = ScalaJS.as.T(color$2);
      ScalaJS.m.Ljs_webapp_Snake$().js$webapp$Snake$$draw$1__Ljs_webapp_Snake$Point2__T__I__Lorg_scalajs_dom_raw_CanvasRenderingContext2D__V(point, color, pointSize$1, ctx$1)
    })
  })(pointSize, ctx))
});
ScalaJS.c.Ljs_webapp_Snake$.prototype["main"] = (function() {
  return this.$$js$exported$meth$main__O()
});
ScalaJS.d.Ljs_webapp_Snake$ = new ScalaJS.ClassTypeData({
  Ljs_webapp_Snake$: 0
}, false, "js.webapp.Snake$", {
  Ljs_webapp_Snake$: 1,
  O: 1,
  sjs_js_JSApp: 1
});
ScalaJS.c.Ljs_webapp_Snake$.prototype.$classData = ScalaJS.d.Ljs_webapp_Snake$;
ScalaJS.n.Ljs_webapp_Snake$ = (void 0);
ScalaJS.m.Ljs_webapp_Snake$ = (function() {
  if ((!ScalaJS.n.Ljs_webapp_Snake$)) {
    ScalaJS.n.Ljs_webapp_Snake$ = new ScalaJS.c.Ljs_webapp_Snake$().init___()
  };
  return ScalaJS.n.Ljs_webapp_Snake$
});
ScalaJS.e["js"] = (ScalaJS.e["js"] || {});
ScalaJS.e["js"]["webapp"] = (ScalaJS.e["js"]["webapp"] || {});
ScalaJS.e["js"]["webapp"]["Snake"] = ScalaJS.m.Ljs_webapp_Snake$;
ScalaJS.d.jl_Boolean = new ScalaJS.ClassTypeData({
  jl_Boolean: 0
}, false, "java.lang.Boolean", {
  jl_Boolean: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ((typeof x) === "boolean")
}));
/** @constructor */
ScalaJS.c.jl_Character = (function() {
  ScalaJS.c.O.call(this);
  this.value$1 = 0
});
ScalaJS.c.jl_Character.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Character.prototype.constructor = ScalaJS.c.jl_Character;
/** @constructor */
ScalaJS.h.jl_Character = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Character.prototype = ScalaJS.c.jl_Character.prototype;
ScalaJS.c.jl_Character.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.jl_Character(that)) {
    var jsx$1 = this.value$1;
    var this$1 = ScalaJS.as.jl_Character(that);
    return (jsx$1 === this$1.value$1)
  } else {
    return false
  }
});
ScalaJS.c.jl_Character.prototype.toString__T = (function() {
  var c = this.value$1;
  return ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c))
});
ScalaJS.c.jl_Character.prototype.init___C = (function(value) {
  this.value$1 = value;
  return this
});
ScalaJS.c.jl_Character.prototype.hashCode__I = (function() {
  return this.value$1
});
ScalaJS.is.jl_Character = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Character)))
});
ScalaJS.as.jl_Character = (function(obj) {
  return ((ScalaJS.is.jl_Character(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Character"))
});
ScalaJS.isArrayOf.jl_Character = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Character)))
});
ScalaJS.asArrayOf.jl_Character = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Character(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Character;", depth))
});
ScalaJS.d.jl_Character = new ScalaJS.ClassTypeData({
  jl_Character: 0
}, false, "java.lang.Character", {
  jl_Character: 1,
  O: 1,
  jl_Comparable: 1
});
ScalaJS.c.jl_Character.prototype.$classData = ScalaJS.d.jl_Character;
/** @constructor */
ScalaJS.c.jl_InheritableThreadLocal = (function() {
  ScalaJS.c.jl_ThreadLocal.call(this)
});
ScalaJS.c.jl_InheritableThreadLocal.prototype = new ScalaJS.h.jl_ThreadLocal();
ScalaJS.c.jl_InheritableThreadLocal.prototype.constructor = ScalaJS.c.jl_InheritableThreadLocal;
/** @constructor */
ScalaJS.h.jl_InheritableThreadLocal = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_InheritableThreadLocal.prototype = ScalaJS.c.jl_InheritableThreadLocal.prototype;
/** @constructor */
ScalaJS.c.jl_Throwable = (function() {
  ScalaJS.c.O.call(this);
  this.s$1 = null;
  this.e$1 = null;
  this.stackTrace$1 = null
});
ScalaJS.c.jl_Throwable.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_Throwable.prototype.constructor = ScalaJS.c.jl_Throwable;
/** @constructor */
ScalaJS.h.jl_Throwable = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Throwable.prototype = ScalaJS.c.jl_Throwable.prototype;
ScalaJS.c.jl_Throwable.prototype.init___ = (function() {
  ScalaJS.c.jl_Throwable.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable = (function() {
  var this$1 = ScalaJS.m.sjsr_StackTrace$();
  this$1.captureState__jl_Throwable__O__V(this, this$1.createException__p1__O());
  return this
});
ScalaJS.c.jl_Throwable.prototype.getMessage__T = (function() {
  return this.s$1
});
ScalaJS.c.jl_Throwable.prototype.toString__T = (function() {
  var className = ScalaJS.objectGetClass(this).getName__T();
  var message = this.getMessage__T();
  return ((message === null) ? className : ((className + ": ") + message))
});
ScalaJS.c.jl_Throwable.prototype.init___T__jl_Throwable = (function(s, e) {
  this.s$1 = s;
  this.e$1 = e;
  this.fillInStackTrace__jl_Throwable();
  return this
});
ScalaJS.is.jl_Throwable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.jl_Throwable)))
});
ScalaJS.as.jl_Throwable = (function(obj) {
  return ((ScalaJS.is.jl_Throwable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.Throwable"))
});
ScalaJS.isArrayOf.jl_Throwable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Throwable)))
});
ScalaJS.asArrayOf.jl_Throwable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Throwable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Throwable;", depth))
});
ScalaJS.is.s_math_ScalaNumber = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_math_ScalaNumber)))
});
ScalaJS.as.s_math_ScalaNumber = (function(obj) {
  return ((ScalaJS.is.s_math_ScalaNumber(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.math.ScalaNumber"))
});
ScalaJS.isArrayOf.s_math_ScalaNumber = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_math_ScalaNumber)))
});
ScalaJS.asArrayOf.s_math_ScalaNumber = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_math_ScalaNumber(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.math.ScalaNumber;", depth))
});
/** @constructor */
ScalaJS.c.s_package$$anon$1 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_package$$anon$1.prototype = new ScalaJS.h.O();
ScalaJS.c.s_package$$anon$1.prototype.constructor = ScalaJS.c.s_package$$anon$1;
/** @constructor */
ScalaJS.h.s_package$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_package$$anon$1.prototype = ScalaJS.c.s_package$$anon$1.prototype;
ScalaJS.c.s_package$$anon$1.prototype.toString__T = (function() {
  return "object AnyRef"
});
ScalaJS.d.s_package$$anon$1 = new ScalaJS.ClassTypeData({
  s_package$$anon$1: 0
}, false, "scala.package$$anon$1", {
  s_package$$anon$1: 1,
  O: 1,
  s_Specializable: 1
});
ScalaJS.c.s_package$$anon$1.prototype.$classData = ScalaJS.d.s_package$$anon$1;
/** @constructor */
ScalaJS.c.s_util_hashing_MurmurHash3$ = (function() {
  ScalaJS.c.s_util_hashing_MurmurHash3.call(this);
  this.arraySeed$2 = 0;
  this.stringSeed$2 = 0;
  this.productSeed$2 = 0;
  this.symmetricSeed$2 = 0;
  this.traversableSeed$2 = 0;
  this.seqSeed$2 = 0;
  this.mapSeed$2 = 0;
  this.setSeed$2 = 0
});
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype = new ScalaJS.h.s_util_hashing_MurmurHash3();
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.constructor = ScalaJS.c.s_util_hashing_MurmurHash3$;
/** @constructor */
ScalaJS.h.s_util_hashing_MurmurHash3$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_hashing_MurmurHash3$.prototype = ScalaJS.c.s_util_hashing_MurmurHash3$.prototype;
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.init___ = (function() {
  ScalaJS.n.s_util_hashing_MurmurHash3$ = this;
  this.seqSeed$2 = ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I("Seq");
  this.mapSeed$2 = ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I("Map");
  this.setSeed$2 = ScalaJS.m.sjsr_RuntimeString$().hashCode__T__I("Set");
  return this
});
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.seqHash__sc_Seq__I = (function(xs) {
  if (ScalaJS.is.sci_List(xs)) {
    var x2 = ScalaJS.as.sci_List(xs);
    return this.listHash__sci_List__I__I(x2, this.seqSeed$2)
  } else {
    return this.orderedHash__sc_TraversableOnce__I__I(xs, this.seqSeed$2)
  }
});
ScalaJS.d.s_util_hashing_MurmurHash3$ = new ScalaJS.ClassTypeData({
  s_util_hashing_MurmurHash3$: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  s_util_hashing_MurmurHash3$: 1,
  s_util_hashing_MurmurHash3: 1,
  O: 1
});
ScalaJS.c.s_util_hashing_MurmurHash3$.prototype.$classData = ScalaJS.d.s_util_hashing_MurmurHash3$;
ScalaJS.n.s_util_hashing_MurmurHash3$ = (void 0);
ScalaJS.m.s_util_hashing_MurmurHash3$ = (function() {
  if ((!ScalaJS.n.s_util_hashing_MurmurHash3$)) {
    ScalaJS.n.s_util_hashing_MurmurHash3$ = new ScalaJS.c.s_util_hashing_MurmurHash3$().init___()
  };
  return ScalaJS.n.s_util_hashing_MurmurHash3$
});
/** @constructor */
ScalaJS.c.scg_GenTraversableFactory = (function() {
  ScalaJS.c.scg_GenericCompanion.call(this);
  this.ReusableCBFInstance$2 = null
});
ScalaJS.c.scg_GenTraversableFactory.prototype = new ScalaJS.h.scg_GenericCompanion();
ScalaJS.c.scg_GenTraversableFactory.prototype.constructor = ScalaJS.c.scg_GenTraversableFactory;
/** @constructor */
ScalaJS.h.scg_GenTraversableFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenTraversableFactory.prototype = ScalaJS.c.scg_GenTraversableFactory.prototype;
ScalaJS.c.scg_GenTraversableFactory.prototype.init___ = (function() {
  this.ReusableCBFInstance$2 = new ScalaJS.c.scg_GenTraversableFactory$$anon$1().init___scg_GenTraversableFactory(this);
  return this
});
/** @constructor */
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom = (function() {
  ScalaJS.c.O.call(this);
  this.$$outer$f = null
});
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype = new ScalaJS.h.O();
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.constructor = ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom;
/** @constructor */
ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom.prototype = ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype;
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__scm_Builder = (function() {
  return this.$$outer$f.newBuilder__scm_Builder()
});
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.apply__O__scm_Builder = (function(from) {
  var from$1 = ScalaJS.as.sc_GenTraversable(from);
  return from$1.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  return this
});
/** @constructor */
ScalaJS.c.sci_List$$anon$1 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sci_List$$anon$1.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_List$$anon$1.prototype.constructor = ScalaJS.c.sci_List$$anon$1;
/** @constructor */
ScalaJS.h.sci_List$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_List$$anon$1.prototype = ScalaJS.c.sci_List$$anon$1.prototype;
ScalaJS.c.sci_List$$anon$1.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_List$$anon$1.prototype.apply__O__O = (function(x) {
  return this
});
ScalaJS.c.sci_List$$anon$1.prototype.toString__T = (function() {
  return "<function1>"
});
ScalaJS.d.sci_List$$anon$1 = new ScalaJS.ClassTypeData({
  sci_List$$anon$1: 0
}, false, "scala.collection.immutable.List$$anon$1", {
  sci_List$$anon$1: 1,
  O: 1,
  F1: 1
});
ScalaJS.c.sci_List$$anon$1.prototype.$classData = ScalaJS.d.sci_List$$anon$1;
ScalaJS.is.scm_Builder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Builder)))
});
ScalaJS.as.scm_Builder = (function(obj) {
  return ((ScalaJS.is.scm_Builder(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.Builder"))
});
ScalaJS.isArrayOf.scm_Builder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Builder)))
});
ScalaJS.asArrayOf.scm_Builder = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_Builder(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.Builder;", depth))
});
/** @constructor */
ScalaJS.c.sr_AbstractFunction0 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_AbstractFunction0.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_AbstractFunction0.prototype.constructor = ScalaJS.c.sr_AbstractFunction0;
/** @constructor */
ScalaJS.h.sr_AbstractFunction0 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_AbstractFunction0.prototype = ScalaJS.c.sr_AbstractFunction0.prototype;
ScalaJS.c.sr_AbstractFunction0.prototype.toString__T = (function() {
  return "<function0>"
});
/** @constructor */
ScalaJS.c.sr_AbstractFunction1 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_AbstractFunction1.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_AbstractFunction1.prototype.constructor = ScalaJS.c.sr_AbstractFunction1;
/** @constructor */
ScalaJS.h.sr_AbstractFunction1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_AbstractFunction1.prototype = ScalaJS.c.sr_AbstractFunction1.prototype;
ScalaJS.c.sr_AbstractFunction1.prototype.toString__T = (function() {
  return "<function1>"
});
/** @constructor */
ScalaJS.c.sr_AbstractFunction2 = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sr_AbstractFunction2.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_AbstractFunction2.prototype.constructor = ScalaJS.c.sr_AbstractFunction2;
/** @constructor */
ScalaJS.h.sr_AbstractFunction2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_AbstractFunction2.prototype = ScalaJS.c.sr_AbstractFunction2.prototype;
ScalaJS.c.sr_AbstractFunction2.prototype.toString__T = (function() {
  return "<function2>"
});
/** @constructor */
ScalaJS.c.sr_BooleanRef = (function() {
  ScalaJS.c.O.call(this);
  this.elem$1 = false
});
ScalaJS.c.sr_BooleanRef.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_BooleanRef.prototype.constructor = ScalaJS.c.sr_BooleanRef;
/** @constructor */
ScalaJS.h.sr_BooleanRef = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_BooleanRef.prototype = ScalaJS.c.sr_BooleanRef.prototype;
ScalaJS.c.sr_BooleanRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
ScalaJS.c.sr_BooleanRef.prototype.init___Z = (function(elem) {
  this.elem$1 = elem;
  return this
});
ScalaJS.d.sr_BooleanRef = new ScalaJS.ClassTypeData({
  sr_BooleanRef: 0
}, false, "scala.runtime.BooleanRef", {
  sr_BooleanRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sr_BooleanRef.prototype.$classData = ScalaJS.d.sr_BooleanRef;
/** @constructor */
ScalaJS.c.sr_IntRef = (function() {
  ScalaJS.c.O.call(this);
  this.elem$1 = 0
});
ScalaJS.c.sr_IntRef.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_IntRef.prototype.constructor = ScalaJS.c.sr_IntRef;
/** @constructor */
ScalaJS.h.sr_IntRef = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_IntRef.prototype = ScalaJS.c.sr_IntRef.prototype;
ScalaJS.c.sr_IntRef.prototype.toString__T = (function() {
  var value = this.elem$1;
  return ("" + value)
});
ScalaJS.c.sr_IntRef.prototype.init___I = (function(elem) {
  this.elem$1 = elem;
  return this
});
ScalaJS.d.sr_IntRef = new ScalaJS.ClassTypeData({
  sr_IntRef: 0
}, false, "scala.runtime.IntRef", {
  sr_IntRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sr_IntRef.prototype.$classData = ScalaJS.d.sr_IntRef;
/** @constructor */
ScalaJS.c.sr_ObjectRef = (function() {
  ScalaJS.c.O.call(this);
  this.elem$1 = null
});
ScalaJS.c.sr_ObjectRef.prototype = new ScalaJS.h.O();
ScalaJS.c.sr_ObjectRef.prototype.constructor = ScalaJS.c.sr_ObjectRef;
/** @constructor */
ScalaJS.h.sr_ObjectRef = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_ObjectRef.prototype = ScalaJS.c.sr_ObjectRef.prototype;
ScalaJS.c.sr_ObjectRef.prototype.toString__T = (function() {
  return ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T(this.elem$1)
});
ScalaJS.c.sr_ObjectRef.prototype.init___O = (function(elem) {
  this.elem$1 = elem;
  return this
});
ScalaJS.d.sr_ObjectRef = new ScalaJS.ClassTypeData({
  sr_ObjectRef: 0
}, false, "scala.runtime.ObjectRef", {
  sr_ObjectRef: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sr_ObjectRef.prototype.$classData = ScalaJS.d.sr_ObjectRef;
/** @constructor */
ScalaJS.c.Ljava_io_OutputStream = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.Ljava_io_OutputStream.prototype = new ScalaJS.h.O();
ScalaJS.c.Ljava_io_OutputStream.prototype.constructor = ScalaJS.c.Ljava_io_OutputStream;
/** @constructor */
ScalaJS.h.Ljava_io_OutputStream = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljava_io_OutputStream.prototype = ScalaJS.c.Ljava_io_OutputStream.prototype;
ScalaJS.d.jl_Byte = new ScalaJS.ClassTypeData({
  jl_Byte: 0
}, false, "java.lang.Byte", {
  jl_Byte: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.isByte(x)
}));
ScalaJS.isArrayOf.jl_Double = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Double)))
});
ScalaJS.asArrayOf.jl_Double = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Double(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Double;", depth))
});
ScalaJS.d.jl_Double = new ScalaJS.ClassTypeData({
  jl_Double: 0
}, false, "java.lang.Double", {
  jl_Double: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ((typeof x) === "number")
}));
/** @constructor */
ScalaJS.c.jl_Error = (function() {
  ScalaJS.c.jl_Throwable.call(this)
});
ScalaJS.c.jl_Error.prototype = new ScalaJS.h.jl_Throwable();
ScalaJS.c.jl_Error.prototype.constructor = ScalaJS.c.jl_Error;
/** @constructor */
ScalaJS.h.jl_Error = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Error.prototype = ScalaJS.c.jl_Error.prototype;
/** @constructor */
ScalaJS.c.jl_Exception = (function() {
  ScalaJS.c.jl_Throwable.call(this)
});
ScalaJS.c.jl_Exception.prototype = new ScalaJS.h.jl_Throwable();
ScalaJS.c.jl_Exception.prototype.constructor = ScalaJS.c.jl_Exception;
/** @constructor */
ScalaJS.h.jl_Exception = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_Exception.prototype = ScalaJS.c.jl_Exception.prototype;
ScalaJS.d.jl_Float = new ScalaJS.ClassTypeData({
  jl_Float: 0
}, false, "java.lang.Float", {
  jl_Float: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.isFloat(x)
}));
ScalaJS.isArrayOf.jl_Integer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Integer)))
});
ScalaJS.asArrayOf.jl_Integer = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Integer(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Integer;", depth))
});
ScalaJS.d.jl_Integer = new ScalaJS.ClassTypeData({
  jl_Integer: 0
}, false, "java.lang.Integer", {
  jl_Integer: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.isInt(x)
}));
ScalaJS.isArrayOf.jl_Long = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.jl_Long)))
});
ScalaJS.asArrayOf.jl_Long = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.jl_Long(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.Long;", depth))
});
ScalaJS.d.jl_Long = new ScalaJS.ClassTypeData({
  jl_Long: 0
}, false, "java.lang.Long", {
  jl_Long: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.is.sjsr_RuntimeLong(x)
}));
ScalaJS.d.jl_Short = new ScalaJS.ClassTypeData({
  jl_Short: 0
}, false, "java.lang.Short", {
  jl_Short: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
}, (void 0), (function(x) {
  return ScalaJS.isShort(x)
}));
/** @constructor */
ScalaJS.c.s_Console$ = (function() {
  ScalaJS.c.s_DeprecatedConsole.call(this);
  this.outVar$2 = null;
  this.errVar$2 = null;
  this.inVar$2 = null
});
ScalaJS.c.s_Console$.prototype = new ScalaJS.h.s_DeprecatedConsole();
ScalaJS.c.s_Console$.prototype.constructor = ScalaJS.c.s_Console$;
/** @constructor */
ScalaJS.h.s_Console$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Console$.prototype = ScalaJS.c.s_Console$.prototype;
ScalaJS.c.s_Console$.prototype.init___ = (function() {
  ScalaJS.n.s_Console$ = this;
  this.outVar$2 = new ScalaJS.c.s_util_DynamicVariable().init___O(ScalaJS.m.jl_System$().out$1);
  this.errVar$2 = new ScalaJS.c.s_util_DynamicVariable().init___O(ScalaJS.m.jl_System$().err$1);
  this.inVar$2 = new ScalaJS.c.s_util_DynamicVariable().init___O(null);
  return this
});
ScalaJS.d.s_Console$ = new ScalaJS.ClassTypeData({
  s_Console$: 0
}, false, "scala.Console$", {
  s_Console$: 1,
  s_DeprecatedConsole: 1,
  O: 1,
  s_io_AnsiColor: 1
});
ScalaJS.c.s_Console$.prototype.$classData = ScalaJS.d.s_Console$;
ScalaJS.n.s_Console$ = (void 0);
ScalaJS.m.s_Console$ = (function() {
  if ((!ScalaJS.n.s_Console$)) {
    ScalaJS.n.s_Console$ = new ScalaJS.c.s_Console$().init___()
  };
  return ScalaJS.n.s_Console$
});
/** @constructor */
ScalaJS.c.s_math_Fractional$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Fractional$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Fractional$.prototype.constructor = ScalaJS.c.s_math_Fractional$;
/** @constructor */
ScalaJS.h.s_math_Fractional$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Fractional$.prototype = ScalaJS.c.s_math_Fractional$.prototype;
ScalaJS.d.s_math_Fractional$ = new ScalaJS.ClassTypeData({
  s_math_Fractional$: 0
}, false, "scala.math.Fractional$", {
  s_math_Fractional$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Fractional$.prototype.$classData = ScalaJS.d.s_math_Fractional$;
ScalaJS.n.s_math_Fractional$ = (void 0);
ScalaJS.m.s_math_Fractional$ = (function() {
  if ((!ScalaJS.n.s_math_Fractional$)) {
    ScalaJS.n.s_math_Fractional$ = new ScalaJS.c.s_math_Fractional$().init___()
  };
  return ScalaJS.n.s_math_Fractional$
});
/** @constructor */
ScalaJS.c.s_math_Integral$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Integral$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Integral$.prototype.constructor = ScalaJS.c.s_math_Integral$;
/** @constructor */
ScalaJS.h.s_math_Integral$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Integral$.prototype = ScalaJS.c.s_math_Integral$.prototype;
ScalaJS.d.s_math_Integral$ = new ScalaJS.ClassTypeData({
  s_math_Integral$: 0
}, false, "scala.math.Integral$", {
  s_math_Integral$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Integral$.prototype.$classData = ScalaJS.d.s_math_Integral$;
ScalaJS.n.s_math_Integral$ = (void 0);
ScalaJS.m.s_math_Integral$ = (function() {
  if ((!ScalaJS.n.s_math_Integral$)) {
    ScalaJS.n.s_math_Integral$ = new ScalaJS.c.s_math_Integral$().init___()
  };
  return ScalaJS.n.s_math_Integral$
});
/** @constructor */
ScalaJS.c.s_math_Numeric$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Numeric$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Numeric$.prototype.constructor = ScalaJS.c.s_math_Numeric$;
/** @constructor */
ScalaJS.h.s_math_Numeric$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Numeric$.prototype = ScalaJS.c.s_math_Numeric$.prototype;
ScalaJS.d.s_math_Numeric$ = new ScalaJS.ClassTypeData({
  s_math_Numeric$: 0
}, false, "scala.math.Numeric$", {
  s_math_Numeric$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Numeric$.prototype.$classData = ScalaJS.d.s_math_Numeric$;
ScalaJS.n.s_math_Numeric$ = (void 0);
ScalaJS.m.s_math_Numeric$ = (function() {
  if ((!ScalaJS.n.s_math_Numeric$)) {
    ScalaJS.n.s_math_Numeric$ = new ScalaJS.c.s_math_Numeric$().init___()
  };
  return ScalaJS.n.s_math_Numeric$
});
/** @constructor */
ScalaJS.c.s_util_DynamicVariable$$anon$1 = (function() {
  ScalaJS.c.jl_InheritableThreadLocal.call(this);
  this.$$outer$3 = null
});
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype = new ScalaJS.h.jl_InheritableThreadLocal();
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.constructor = ScalaJS.c.s_util_DynamicVariable$$anon$1;
/** @constructor */
ScalaJS.h.s_util_DynamicVariable$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_DynamicVariable$$anon$1.prototype = ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype;
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.init___s_util_DynamicVariable = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$3 = $$outer
  };
  ScalaJS.c.jl_InheritableThreadLocal.prototype.init___.call(this);
  return this
});
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.initialValue__O = (function() {
  return this.$$outer$3.scala$util$DynamicVariable$$init$f
});
ScalaJS.d.s_util_DynamicVariable$$anon$1 = new ScalaJS.ClassTypeData({
  s_util_DynamicVariable$$anon$1: 0
}, false, "scala.util.DynamicVariable$$anon$1", {
  s_util_DynamicVariable$$anon$1: 1,
  jl_InheritableThreadLocal: 1,
  jl_ThreadLocal: 1,
  O: 1
});
ScalaJS.c.s_util_DynamicVariable$$anon$1.prototype.$classData = ScalaJS.d.s_util_DynamicVariable$$anon$1;
/** @constructor */
ScalaJS.c.s_util_Left$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_Left$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_Left$.prototype.constructor = ScalaJS.c.s_util_Left$;
/** @constructor */
ScalaJS.h.s_util_Left$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Left$.prototype = ScalaJS.c.s_util_Left$.prototype;
ScalaJS.c.s_util_Left$.prototype.toString__T = (function() {
  return "Left"
});
ScalaJS.d.s_util_Left$ = new ScalaJS.ClassTypeData({
  s_util_Left$: 0
}, false, "scala.util.Left$", {
  s_util_Left$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_util_Left$.prototype.$classData = ScalaJS.d.s_util_Left$;
ScalaJS.n.s_util_Left$ = (void 0);
ScalaJS.m.s_util_Left$ = (function() {
  if ((!ScalaJS.n.s_util_Left$)) {
    ScalaJS.n.s_util_Left$ = new ScalaJS.c.s_util_Left$().init___()
  };
  return ScalaJS.n.s_util_Left$
});
/** @constructor */
ScalaJS.c.s_util_Right$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_util_Right$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_Right$.prototype.constructor = ScalaJS.c.s_util_Right$;
/** @constructor */
ScalaJS.h.s_util_Right$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Right$.prototype = ScalaJS.c.s_util_Right$.prototype;
ScalaJS.c.s_util_Right$.prototype.toString__T = (function() {
  return "Right"
});
ScalaJS.d.s_util_Right$ = new ScalaJS.ClassTypeData({
  s_util_Right$: 0
}, false, "scala.util.Right$", {
  s_util_Right$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_util_Right$.prototype.$classData = ScalaJS.d.s_util_Right$;
ScalaJS.n.s_util_Right$ = (void 0);
ScalaJS.m.s_util_Right$ = (function() {
  if ((!ScalaJS.n.s_util_Right$)) {
    ScalaJS.n.s_util_Right$ = new ScalaJS.c.s_util_Right$().init___()
  };
  return ScalaJS.n.s_util_Right$
});
/** @constructor */
ScalaJS.c.s_util_control_NoStackTrace$ = (function() {
  ScalaJS.c.O.call(this);
  this.$$undnoSuppression$1 = false
});
ScalaJS.c.s_util_control_NoStackTrace$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_util_control_NoStackTrace$.prototype.constructor = ScalaJS.c.s_util_control_NoStackTrace$;
/** @constructor */
ScalaJS.h.s_util_control_NoStackTrace$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_control_NoStackTrace$.prototype = ScalaJS.c.s_util_control_NoStackTrace$.prototype;
ScalaJS.c.s_util_control_NoStackTrace$.prototype.init___ = (function() {
  ScalaJS.n.s_util_control_NoStackTrace$ = this;
  this.$$undnoSuppression$1 = false;
  return this
});
ScalaJS.d.s_util_control_NoStackTrace$ = new ScalaJS.ClassTypeData({
  s_util_control_NoStackTrace$: 0
}, false, "scala.util.control.NoStackTrace$", {
  s_util_control_NoStackTrace$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_util_control_NoStackTrace$.prototype.$classData = ScalaJS.d.s_util_control_NoStackTrace$;
ScalaJS.n.s_util_control_NoStackTrace$ = (void 0);
ScalaJS.m.s_util_control_NoStackTrace$ = (function() {
  if ((!ScalaJS.n.s_util_control_NoStackTrace$)) {
    ScalaJS.n.s_util_control_NoStackTrace$ = new ScalaJS.c.s_util_control_NoStackTrace$().init___()
  };
  return ScalaJS.n.s_util_control_NoStackTrace$
});
/** @constructor */
ScalaJS.c.sc_IndexedSeq$$anon$1 = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
});
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype = new ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom();
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype.constructor = ScalaJS.c.sc_IndexedSeq$$anon$1;
/** @constructor */
ScalaJS.h.sc_IndexedSeq$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_IndexedSeq$$anon$1.prototype = ScalaJS.c.sc_IndexedSeq$$anon$1.prototype;
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype.apply__scm_Builder = (function() {
  ScalaJS.m.sc_IndexedSeq$();
  ScalaJS.m.sci_IndexedSeq$();
  ScalaJS.m.sci_Vector$();
  return new ScalaJS.c.sci_VectorBuilder().init___()
});
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype.init___ = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, ScalaJS.m.sc_IndexedSeq$());
  return this
});
ScalaJS.d.sc_IndexedSeq$$anon$1 = new ScalaJS.ClassTypeData({
  sc_IndexedSeq$$anon$1: 0
}, false, "scala.collection.IndexedSeq$$anon$1", {
  sc_IndexedSeq$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
ScalaJS.c.sc_IndexedSeq$$anon$1.prototype.$classData = ScalaJS.d.sc_IndexedSeq$$anon$1;
/** @constructor */
ScalaJS.c.scg_GenSeqFactory = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this)
});
ScalaJS.c.scg_GenSeqFactory.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.scg_GenSeqFactory.prototype.constructor = ScalaJS.c.scg_GenSeqFactory;
/** @constructor */
ScalaJS.h.scg_GenSeqFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenSeqFactory.prototype = ScalaJS.c.scg_GenSeqFactory.prototype;
/** @constructor */
ScalaJS.c.scg_GenTraversableFactory$$anon$1 = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.call(this);
  this.$$outer$2 = null
});
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype = new ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom();
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype.constructor = ScalaJS.c.scg_GenTraversableFactory$$anon$1;
/** @constructor */
ScalaJS.h.scg_GenTraversableFactory$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_GenTraversableFactory$$anon$1.prototype = ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype;
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype.apply__scm_Builder = (function() {
  return this.$$outer$2.newBuilder__scm_Builder()
});
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype.init___scg_GenTraversableFactory = (function($$outer) {
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$2 = $$outer
  };
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, $$outer);
  return this
});
ScalaJS.d.scg_GenTraversableFactory$$anon$1 = new ScalaJS.ClassTypeData({
  scg_GenTraversableFactory$$anon$1: 0
}, false, "scala.collection.generic.GenTraversableFactory$$anon$1", {
  scg_GenTraversableFactory$$anon$1: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
ScalaJS.c.scg_GenTraversableFactory$$anon$1.prototype.$classData = ScalaJS.d.scg_GenTraversableFactory$$anon$1;
/** @constructor */
ScalaJS.c.sci_$colon$colon$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sci_$colon$colon$.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_$colon$colon$.prototype.constructor = ScalaJS.c.sci_$colon$colon$;
/** @constructor */
ScalaJS.h.sci_$colon$colon$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_$colon$colon$.prototype = ScalaJS.c.sci_$colon$colon$.prototype;
ScalaJS.c.sci_$colon$colon$.prototype.toString__T = (function() {
  return "::"
});
ScalaJS.d.sci_$colon$colon$ = new ScalaJS.ClassTypeData({
  sci_$colon$colon$: 0
}, false, "scala.collection.immutable.$colon$colon$", {
  sci_$colon$colon$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_$colon$colon$.prototype.$classData = ScalaJS.d.sci_$colon$colon$;
ScalaJS.n.sci_$colon$colon$ = (void 0);
ScalaJS.m.sci_$colon$colon$ = (function() {
  if ((!ScalaJS.n.sci_$colon$colon$)) {
    ScalaJS.n.sci_$colon$colon$ = new ScalaJS.c.sci_$colon$colon$().init___()
  };
  return ScalaJS.n.sci_$colon$colon$
});
/** @constructor */
ScalaJS.c.sci_Range$ = (function() {
  ScalaJS.c.O.call(this);
  this.MAX$undPRINT$1 = 0
});
ScalaJS.c.sci_Range$.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_Range$.prototype.constructor = ScalaJS.c.sci_Range$;
/** @constructor */
ScalaJS.h.sci_Range$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Range$.prototype = ScalaJS.c.sci_Range$.prototype;
ScalaJS.c.sci_Range$.prototype.init___ = (function() {
  ScalaJS.n.sci_Range$ = this;
  this.MAX$undPRINT$1 = 512;
  return this
});
ScalaJS.d.sci_Range$ = new ScalaJS.ClassTypeData({
  sci_Range$: 0
}, false, "scala.collection.immutable.Range$", {
  sci_Range$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Range$.prototype.$classData = ScalaJS.d.sci_Range$;
ScalaJS.n.sci_Range$ = (void 0);
ScalaJS.m.sci_Range$ = (function() {
  if ((!ScalaJS.n.sci_Range$)) {
    ScalaJS.n.sci_Range$ = new ScalaJS.c.sci_Range$().init___()
  };
  return ScalaJS.n.sci_Range$
});
/** @constructor */
ScalaJS.c.sci_Stream$StreamCanBuildFrom = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.call(this)
});
ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype = new ScalaJS.h.scg_GenTraversableFactory$GenericCanBuildFrom();
ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype.constructor = ScalaJS.c.sci_Stream$StreamCanBuildFrom;
/** @constructor */
ScalaJS.h.sci_Stream$StreamCanBuildFrom = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$StreamCanBuildFrom.prototype = ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype;
ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype.init___ = (function() {
  ScalaJS.c.scg_GenTraversableFactory$GenericCanBuildFrom.prototype.init___scg_GenTraversableFactory.call(this, ScalaJS.m.sci_Stream$());
  return this
});
ScalaJS.d.sci_Stream$StreamCanBuildFrom = new ScalaJS.ClassTypeData({
  sci_Stream$StreamCanBuildFrom: 0
}, false, "scala.collection.immutable.Stream$StreamCanBuildFrom", {
  sci_Stream$StreamCanBuildFrom: 1,
  scg_GenTraversableFactory$GenericCanBuildFrom: 1,
  O: 1,
  scg_CanBuildFrom: 1
});
ScalaJS.c.sci_Stream$StreamCanBuildFrom.prototype.$classData = ScalaJS.d.sci_Stream$StreamCanBuildFrom;
/** @constructor */
ScalaJS.c.scm_StringBuilder$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.scm_StringBuilder$.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_StringBuilder$.prototype.constructor = ScalaJS.c.scm_StringBuilder$;
/** @constructor */
ScalaJS.h.scm_StringBuilder$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_StringBuilder$.prototype = ScalaJS.c.scm_StringBuilder$.prototype;
ScalaJS.d.scm_StringBuilder$ = new ScalaJS.ClassTypeData({
  scm_StringBuilder$: 0
}, false, "scala.collection.mutable.StringBuilder$", {
  scm_StringBuilder$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_StringBuilder$.prototype.$classData = ScalaJS.d.scm_StringBuilder$;
ScalaJS.n.scm_StringBuilder$ = (void 0);
ScalaJS.m.scm_StringBuilder$ = (function() {
  if ((!ScalaJS.n.scm_StringBuilder$)) {
    ScalaJS.n.scm_StringBuilder$ = new ScalaJS.c.scm_StringBuilder$().init___()
  };
  return ScalaJS.n.scm_StringBuilder$
});
/** @constructor */
ScalaJS.c.sjsr_AnonFunction0 = (function() {
  ScalaJS.c.sr_AbstractFunction0.call(this);
  this.f$2 = null
});
ScalaJS.c.sjsr_AnonFunction0.prototype = new ScalaJS.h.sr_AbstractFunction0();
ScalaJS.c.sjsr_AnonFunction0.prototype.constructor = ScalaJS.c.sjsr_AnonFunction0;
/** @constructor */
ScalaJS.h.sjsr_AnonFunction0 = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_AnonFunction0.prototype = ScalaJS.c.sjsr_AnonFunction0.prototype;
ScalaJS.c.sjsr_AnonFunction0.prototype.apply__O = (function() {
  return (0, this.f$2)()
});
ScalaJS.c.sjsr_AnonFunction0.prototype.init___sjs_js_Function0 = (function(f) {
  this.f$2 = f;
  return this
});
ScalaJS.d.sjsr_AnonFunction0 = new ScalaJS.ClassTypeData({
  sjsr_AnonFunction0: 0
}, false, "scala.scalajs.runtime.AnonFunction0", {
  sjsr_AnonFunction0: 1,
  sr_AbstractFunction0: 1,
  O: 1,
  F0: 1
});
ScalaJS.c.sjsr_AnonFunction0.prototype.$classData = ScalaJS.d.sjsr_AnonFunction0;
/** @constructor */
ScalaJS.c.sjsr_AnonFunction1 = (function() {
  ScalaJS.c.sr_AbstractFunction1.call(this);
  this.f$2 = null
});
ScalaJS.c.sjsr_AnonFunction1.prototype = new ScalaJS.h.sr_AbstractFunction1();
ScalaJS.c.sjsr_AnonFunction1.prototype.constructor = ScalaJS.c.sjsr_AnonFunction1;
/** @constructor */
ScalaJS.h.sjsr_AnonFunction1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_AnonFunction1.prototype = ScalaJS.c.sjsr_AnonFunction1.prototype;
ScalaJS.c.sjsr_AnonFunction1.prototype.apply__O__O = (function(arg1) {
  return (0, this.f$2)(arg1)
});
ScalaJS.c.sjsr_AnonFunction1.prototype.init___sjs_js_Function1 = (function(f) {
  this.f$2 = f;
  return this
});
ScalaJS.d.sjsr_AnonFunction1 = new ScalaJS.ClassTypeData({
  sjsr_AnonFunction1: 0
}, false, "scala.scalajs.runtime.AnonFunction1", {
  sjsr_AnonFunction1: 1,
  sr_AbstractFunction1: 1,
  O: 1,
  F1: 1
});
ScalaJS.c.sjsr_AnonFunction1.prototype.$classData = ScalaJS.d.sjsr_AnonFunction1;
/** @constructor */
ScalaJS.c.sjsr_AnonFunction2 = (function() {
  ScalaJS.c.sr_AbstractFunction2.call(this);
  this.f$2 = null
});
ScalaJS.c.sjsr_AnonFunction2.prototype = new ScalaJS.h.sr_AbstractFunction2();
ScalaJS.c.sjsr_AnonFunction2.prototype.constructor = ScalaJS.c.sjsr_AnonFunction2;
/** @constructor */
ScalaJS.h.sjsr_AnonFunction2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_AnonFunction2.prototype = ScalaJS.c.sjsr_AnonFunction2.prototype;
ScalaJS.c.sjsr_AnonFunction2.prototype.init___sjs_js_Function2 = (function(f) {
  this.f$2 = f;
  return this
});
ScalaJS.c.sjsr_AnonFunction2.prototype.apply__O__O__O = (function(arg1, arg2) {
  return (0, this.f$2)(arg1, arg2)
});
ScalaJS.d.sjsr_AnonFunction2 = new ScalaJS.ClassTypeData({
  sjsr_AnonFunction2: 0
}, false, "scala.scalajs.runtime.AnonFunction2", {
  sjsr_AnonFunction2: 1,
  sr_AbstractFunction2: 1,
  O: 1,
  F2: 1
});
ScalaJS.c.sjsr_AnonFunction2.prototype.$classData = ScalaJS.d.sjsr_AnonFunction2;
/** @constructor */
ScalaJS.c.sjsr_RuntimeLong = (function() {
  ScalaJS.c.jl_Number.call(this);
  this.l$2 = 0;
  this.m$2 = 0;
  this.h$2 = 0
});
ScalaJS.c.sjsr_RuntimeLong.prototype = new ScalaJS.h.jl_Number();
ScalaJS.c.sjsr_RuntimeLong.prototype.constructor = ScalaJS.c.sjsr_RuntimeLong;
/** @constructor */
ScalaJS.h.sjsr_RuntimeLong = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_RuntimeLong.prototype = ScalaJS.c.sjsr_RuntimeLong.prototype;
ScalaJS.c.sjsr_RuntimeLong.prototype.longValue__J = (function() {
  return ScalaJS.uJ(this)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.powerOfTwo__p2__I = (function() {
  return (((((this.h$2 === 0) && (this.m$2 === 0)) && (this.l$2 !== 0)) && ((this.l$2 & (((-1) + this.l$2) | 0)) === 0)) ? ScalaJS.m.jl_Integer$().numberOfTrailingZeros__I__I(this.l$2) : (((((this.h$2 === 0) && (this.m$2 !== 0)) && (this.l$2 === 0)) && ((this.m$2 & (((-1) + this.m$2) | 0)) === 0)) ? ((22 + ScalaJS.m.jl_Integer$().numberOfTrailingZeros__I__I(this.m$2)) | 0) : (((((this.h$2 !== 0) && (this.m$2 === 0)) && (this.l$2 === 0)) && ((this.h$2 & (((-1) + this.h$2) | 0)) === 0)) ? ((44 + ScalaJS.m.jl_Integer$().numberOfTrailingZeros__I__I(this.h$2)) | 0) : (-1))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$bar__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 | y.l$2), (this.m$2 | y.m$2), (this.h$2 | y.h$2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater$eq__sjsr_RuntimeLong__Z = (function(y) {
  return (((524288 & this.h$2) === 0) ? (((((524288 & y.h$2) !== 0) || (this.h$2 > y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 > y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 >= y.l$2))) : (!(((((524288 & y.h$2) === 0) || (this.h$2 < y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 < y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 < y.l$2)))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.byteValue__B = (function() {
  return this.toByte__B()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toShort__S = (function() {
  return ((this.toInt__I() << 16) >> 16)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.sjsr_RuntimeLong(that)) {
    var x2 = ScalaJS.as.sjsr_RuntimeLong(that);
    return this.equals__sjsr_RuntimeLong__Z(x2)
  } else {
    return false
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$less__sjsr_RuntimeLong__Z = (function(y) {
  return y.$$greater__sjsr_RuntimeLong__Z(this)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$times__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  var _1 = (8191 & this.l$2);
  var _2 = ((this.l$2 >> 13) | ((15 & this.m$2) << 9));
  var _3 = (8191 & (this.m$2 >> 4));
  var _4 = ((this.m$2 >> 17) | ((255 & this.h$2) << 5));
  var _5 = ((1048320 & this.h$2) >> 8);
  matchEnd3: {
    var x$1;
    var x$1_$_$$und1$1 = _1;
    var x$1_$_$$und2$1 = _2;
    var x$1_$_$$und3$1 = _3;
    var x$1_$_$$und4$1 = _4;
    var x$1_$_$$und5$1 = _5;
    break matchEnd3
  };
  var a0$2 = ScalaJS.uI(x$1_$_$$und1$1);
  var a1$2 = ScalaJS.uI(x$1_$_$$und2$1);
  var a2$2 = ScalaJS.uI(x$1_$_$$und3$1);
  var a3$2 = ScalaJS.uI(x$1_$_$$und4$1);
  var a4$2 = ScalaJS.uI(x$1_$_$$und5$1);
  var _1$1 = (8191 & y.l$2);
  var _2$1 = ((y.l$2 >> 13) | ((15 & y.m$2) << 9));
  var _3$1 = (8191 & (y.m$2 >> 4));
  var _4$1 = ((y.m$2 >> 17) | ((255 & y.h$2) << 5));
  var _5$1 = ((1048320 & y.h$2) >> 8);
  matchEnd3$2: {
    var x$2;
    var x$2_$_$$und1$1 = _1$1;
    var x$2_$_$$und2$1 = _2$1;
    var x$2_$_$$und3$1 = _3$1;
    var x$2_$_$$und4$1 = _4$1;
    var x$2_$_$$und5$1 = _5$1;
    break matchEnd3$2
  };
  var b0$2 = ScalaJS.uI(x$2_$_$$und1$1);
  var b1$2 = ScalaJS.uI(x$2_$_$$und2$1);
  var b2$2 = ScalaJS.uI(x$2_$_$$und3$1);
  var b3$2 = ScalaJS.uI(x$2_$_$$und4$1);
  var b4$2 = ScalaJS.uI(x$2_$_$$und5$1);
  var p0 = ScalaJS.imul(a0$2, b0$2);
  var p1 = ScalaJS.imul(a1$2, b0$2);
  var p2 = ScalaJS.imul(a2$2, b0$2);
  var p3 = ScalaJS.imul(a3$2, b0$2);
  var p4 = ScalaJS.imul(a4$2, b0$2);
  if ((b1$2 !== 0)) {
    p1 = ((p1 + ScalaJS.imul(a0$2, b1$2)) | 0);
    p2 = ((p2 + ScalaJS.imul(a1$2, b1$2)) | 0);
    p3 = ((p3 + ScalaJS.imul(a2$2, b1$2)) | 0);
    p4 = ((p4 + ScalaJS.imul(a3$2, b1$2)) | 0)
  };
  if ((b2$2 !== 0)) {
    p2 = ((p2 + ScalaJS.imul(a0$2, b2$2)) | 0);
    p3 = ((p3 + ScalaJS.imul(a1$2, b2$2)) | 0);
    p4 = ((p4 + ScalaJS.imul(a2$2, b2$2)) | 0)
  };
  if ((b3$2 !== 0)) {
    p3 = ((p3 + ScalaJS.imul(a0$2, b3$2)) | 0);
    p4 = ((p4 + ScalaJS.imul(a1$2, b3$2)) | 0)
  };
  if ((b4$2 !== 0)) {
    p4 = ((p4 + ScalaJS.imul(a0$2, b4$2)) | 0)
  };
  var c00 = (4194303 & p0);
  var c01 = ((511 & p1) << 13);
  var c0 = ((c00 + c01) | 0);
  var c10 = (p0 >> 22);
  var c11 = (p1 >> 9);
  var c12 = ((262143 & p2) << 4);
  var c13 = ((31 & p3) << 17);
  var c1 = ((((((c10 + c11) | 0) + c12) | 0) + c13) | 0);
  var c22 = (p2 >> 18);
  var c23 = (p3 >> 5);
  var c24 = ((4095 & p4) << 8);
  var c2 = ((((c22 + c23) | 0) + c24) | 0);
  var c1n = ((c1 + (c0 >> 22)) | 0);
  var h = ((c2 + (c1n >> 22)) | 0);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & c0), (4194303 & c1n), (1048575 & h))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.init___I__I__I = (function(l, m, h) {
  this.l$2 = l;
  this.m$2 = m;
  this.h$2 = h;
  return this
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$percent__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return ScalaJS.as.sjsr_RuntimeLong(this.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(y)[1])
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toString__T = (function() {
  if ((((this.l$2 === 0) && (this.m$2 === 0)) && (this.h$2 === 0))) {
    return "0"
  } else if (this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1)) {
    return "-9223372036854775808"
  } else if (((524288 & this.h$2) !== 0)) {
    return ("-" + this.unary$und$minus__sjsr_RuntimeLong().toString__T())
  } else {
    var tenPow9 = ScalaJS.m.sjsr_RuntimeLong$().TenPow9$1;
    var v = this;
    var acc = "";
    _toString0: while (true) {
      var this$1 = v;
      if ((((this$1.l$2 === 0) && (this$1.m$2 === 0)) && (this$1.h$2 === 0))) {
        return acc
      } else {
        var quotRem = v.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(tenPow9);
        var quot = ScalaJS.as.sjsr_RuntimeLong(quotRem[0]);
        var rem = ScalaJS.as.sjsr_RuntimeLong(quotRem[1]);
        var this$2 = rem.toInt__I();
        var digits = ("" + this$2);
        if ((((quot.l$2 === 0) && (quot.m$2 === 0)) && (quot.h$2 === 0))) {
          var zeroPrefix = ""
        } else {
          var beginIndex = ScalaJS.uI(digits["length"]);
          var zeroPrefix = ScalaJS.as.T("000000000"["substring"](beginIndex))
        };
        var temp$acc = ((zeroPrefix + digits) + acc);
        v = quot;
        acc = temp$acc;
        continue _toString0
      }
    }
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$less$eq__sjsr_RuntimeLong__Z = (function(y) {
  return y.$$greater$eq__sjsr_RuntimeLong__Z(this)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.compareTo__O__I = (function(x$1) {
  var that = ScalaJS.as.sjsr_RuntimeLong(x$1);
  return this.compareTo__sjsr_RuntimeLong__I(ScalaJS.as.sjsr_RuntimeLong(that))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.scala$scalajs$runtime$RuntimeLong$$setBit__I__sjsr_RuntimeLong = (function(bit) {
  return ((bit < 22) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 | (1 << bit)), this.m$2, this.h$2) : ((bit < 44) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(this.l$2, (this.m$2 | (1 << (((-22) + bit) | 0))), this.h$2) : new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(this.l$2, this.m$2, (this.h$2 | (1 << (((-44) + bit) | 0))))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array = (function(y) {
  if ((((y.l$2 === 0) && (y.m$2 === 0)) && (y.h$2 === 0))) {
    throw new ScalaJS.c.jl_ArithmeticException().init___T("/ by zero")
  } else if ((((this.l$2 === 0) && (this.m$2 === 0)) && (this.h$2 === 0))) {
    return [ScalaJS.m.sjsr_RuntimeLong$().Zero$1, ScalaJS.m.sjsr_RuntimeLong$().Zero$1]
  } else if (y.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1)) {
    return (this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1) ? [ScalaJS.m.sjsr_RuntimeLong$().One$1, ScalaJS.m.sjsr_RuntimeLong$().Zero$1] : [ScalaJS.m.sjsr_RuntimeLong$().Zero$1, this])
  } else {
    var xNegative = ((524288 & this.h$2) !== 0);
    var yNegative = ((524288 & y.h$2) !== 0);
    var xMinValue = this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1);
    var pow = y.powerOfTwo__p2__I();
    if ((pow >= 0)) {
      if (xMinValue) {
        var z = this.$$greater$greater__I__sjsr_RuntimeLong(pow);
        return [(yNegative ? z.unary$und$minus__sjsr_RuntimeLong() : z), ScalaJS.m.sjsr_RuntimeLong$().Zero$1]
      } else {
        var absX = (((524288 & this.h$2) !== 0) ? this.unary$und$minus__sjsr_RuntimeLong() : this);
        var absZ = absX.$$greater$greater__I__sjsr_RuntimeLong(pow);
        var z$2 = ((xNegative !== yNegative) ? absZ.unary$und$minus__sjsr_RuntimeLong() : absZ);
        var remAbs = ((pow <= 22) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((absX.l$2 & (((-1) + (1 << pow)) | 0)), 0, 0) : ((pow <= 44) ? new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(absX.l$2, (absX.m$2 & (((-1) + (1 << (((-22) + pow) | 0))) | 0)), 0) : new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(absX.l$2, absX.m$2, (absX.h$2 & (((-1) + (1 << (((-44) + pow) | 0))) | 0)))));
        var rem = (xNegative ? remAbs.unary$und$minus__sjsr_RuntimeLong() : remAbs);
        return [z$2, rem]
      }
    } else {
      var absY = (((524288 & y.h$2) !== 0) ? y.unary$und$minus__sjsr_RuntimeLong() : y);
      if (xMinValue) {
        var newX = ScalaJS.m.sjsr_RuntimeLong$().MaxValue$1
      } else {
        var absX$2 = (((524288 & this.h$2) !== 0) ? this.unary$und$minus__sjsr_RuntimeLong() : this);
        if (absY.$$greater__sjsr_RuntimeLong__Z(absX$2)) {
          var newX;
          return [ScalaJS.m.sjsr_RuntimeLong$().Zero$1, this]
        } else {
          var newX = absX$2
        }
      };
      var shift = ((absY.numberOfLeadingZeros__I() - newX.numberOfLeadingZeros__I()) | 0);
      var yShift = absY.$$less$less__I__sjsr_RuntimeLong(shift);
      var shift$1 = shift;
      var yShift$1 = yShift;
      var curX = newX;
      var quot = ScalaJS.m.sjsr_RuntimeLong$().Zero$1;
      x: {
        var x1;
        _divide0: while (true) {
          if ((shift$1 < 0)) {
            var jsx$1 = true
          } else {
            var this$1 = curX;
            var jsx$1 = (((this$1.l$2 === 0) && (this$1.m$2 === 0)) && (this$1.h$2 === 0))
          };
          if (jsx$1) {
            var _1 = quot;
            var _2 = curX;
            var x1_$_$$und1$f = _1;
            var x1_$_$$und2$f = _2;
            break x
          } else {
            var this$2 = curX;
            var y$1 = yShift$1;
            var newX$1 = this$2.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y$1.unary$und$minus__sjsr_RuntimeLong());
            if (((524288 & newX$1.h$2) === 0)) {
              var temp$shift = (((-1) + shift$1) | 0);
              var temp$yShift = yShift$1.$$greater$greater__I__sjsr_RuntimeLong(1);
              var temp$quot = quot.scala$scalajs$runtime$RuntimeLong$$setBit__I__sjsr_RuntimeLong(shift$1);
              shift$1 = temp$shift;
              yShift$1 = temp$yShift;
              curX = newX$1;
              quot = temp$quot;
              continue _divide0
            } else {
              var temp$shift$2 = (((-1) + shift$1) | 0);
              var temp$yShift$2 = yShift$1.$$greater$greater__I__sjsr_RuntimeLong(1);
              shift$1 = temp$shift$2;
              yShift$1 = temp$yShift$2;
              continue _divide0
            }
          }
        }
      };
      var absQuot = ScalaJS.as.sjsr_RuntimeLong(x1_$_$$und1$f);
      var absRem = ScalaJS.as.sjsr_RuntimeLong(x1_$_$$und2$f);
      var x$3_$_$$und1$f = absQuot;
      var x$3_$_$$und2$f = absRem;
      var absQuot$2 = ScalaJS.as.sjsr_RuntimeLong(x$3_$_$$und1$f);
      var absRem$2 = ScalaJS.as.sjsr_RuntimeLong(x$3_$_$$und2$f);
      var quot$1 = ((xNegative !== yNegative) ? absQuot$2.unary$und$minus__sjsr_RuntimeLong() : absQuot$2);
      if ((xNegative && xMinValue)) {
        var this$3 = absRem$2.unary$und$minus__sjsr_RuntimeLong();
        var y$2 = ScalaJS.m.sjsr_RuntimeLong$().One$1;
        var rem$1 = this$3.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y$2.unary$und$minus__sjsr_RuntimeLong())
      } else {
        var rem$1 = (xNegative ? absRem$2.unary$und$minus__sjsr_RuntimeLong() : absRem$2)
      };
      return [quot$1, rem$1]
    }
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$amp__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 & y.l$2), (this.m$2 & y.m$2), (this.h$2 & y.h$2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater$greater$greater__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = ((this.l$2 >> n) | (this.m$2 << remBits));
    var m = ((this.m$2 >> n) | (this.h$2 << remBits));
    var h = ((this.h$2 >>> n) | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var l$1 = ((this.m$2 >> shfBits) | (this.h$2 << remBits$2));
    var m$1 = ((this.h$2 >>> shfBits) | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$1), (4194303 & m$1), 0)
  } else {
    var l$2 = ((this.h$2 >>> (((-44) + n) | 0)) | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$2), 0, 0)
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.compareTo__sjsr_RuntimeLong__I = (function(that) {
  return (this.equals__sjsr_RuntimeLong__Z(that) ? 0 : (this.$$greater__sjsr_RuntimeLong__Z(that) ? 1 : (-1)))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater__sjsr_RuntimeLong__Z = (function(y) {
  return (((524288 & this.h$2) === 0) ? (((((524288 & y.h$2) !== 0) || (this.h$2 > y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 > y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 > y.l$2))) : (!(((((524288 & y.h$2) === 0) || (this.h$2 < y.h$2)) || ((this.h$2 === y.h$2) && (this.m$2 < y.m$2))) || (((this.h$2 === y.h$2) && (this.m$2 === y.m$2)) && (this.l$2 <= y.l$2)))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$less$less__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = (this.l$2 << n);
    var m = ((this.m$2 << n) | (this.l$2 >> remBits));
    var h = ((this.h$2 << n) | (this.m$2 >> remBits));
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var m$1 = (this.l$2 << shfBits);
    var h$1 = ((this.m$2 << shfBits) | (this.l$2 >> remBits$2));
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, (4194303 & m$1), (1048575 & h$1))
  } else {
    var h$2 = (this.l$2 << (((-44) + n) | 0));
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, 0, (1048575 & h$2))
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toInt__I = (function() {
  return (this.l$2 | (this.m$2 << 22))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.init___I = (function(value) {
  ScalaJS.c.sjsr_RuntimeLong.prototype.init___I__I__I.call(this, (4194303 & value), (4194303 & (value >> 22)), ((value < 0) ? 1048575 : 0));
  return this
});
ScalaJS.c.sjsr_RuntimeLong.prototype.notEquals__sjsr_RuntimeLong__Z = (function(that) {
  return (!this.equals__sjsr_RuntimeLong__Z(that))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.unary$und$minus__sjsr_RuntimeLong = (function() {
  var neg0 = (4194303 & ((1 + (~this.l$2)) | 0));
  var neg1 = (4194303 & (((~this.m$2) + ((neg0 === 0) ? 1 : 0)) | 0));
  var neg2 = (1048575 & (((~this.h$2) + (((neg0 === 0) && (neg1 === 0)) ? 1 : 0)) | 0));
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(neg0, neg1, neg2)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.shortValue__S = (function() {
  return this.toShort__S()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  var sum0 = ((this.l$2 + y.l$2) | 0);
  var sum1 = ((((this.m$2 + y.m$2) | 0) + (sum0 >> 22)) | 0);
  var sum2 = ((((this.h$2 + y.h$2) | 0) + (sum1 >> 22)) | 0);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & sum0), (4194303 & sum1), (1048575 & sum2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$greater$greater__I__sjsr_RuntimeLong = (function(n_in) {
  var n = (63 & n_in);
  var negative = ((524288 & this.h$2) !== 0);
  var xh = (negative ? ((-1048576) | this.h$2) : this.h$2);
  if ((n < 22)) {
    var remBits = ((22 - n) | 0);
    var l = ((this.l$2 >> n) | (this.m$2 << remBits));
    var m = ((this.m$2 >> n) | (xh << remBits));
    var h = (xh >> n);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
  } else if ((n < 44)) {
    var shfBits = (((-22) + n) | 0);
    var remBits$2 = ((44 - n) | 0);
    var l$1 = ((this.m$2 >> shfBits) | (xh << remBits$2));
    var m$1 = (xh >> shfBits);
    var h$1 = (negative ? 1048575 : 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$1), (4194303 & m$1), (1048575 & h$1))
  } else {
    var l$2 = (xh >> (((-44) + n) | 0));
    var m$2 = (negative ? 4194303 : 0);
    var h$2 = (negative ? 1048575 : 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l$2), (4194303 & m$2), (1048575 & h$2))
  }
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toDouble__D = (function() {
  return (this.equals__sjsr_RuntimeLong__Z(ScalaJS.m.sjsr_RuntimeLong$().MinValue$1) ? (-9.223372036854776E18) : (((524288 & this.h$2) !== 0) ? (-this.unary$und$minus__sjsr_RuntimeLong().toDouble__D()) : ((this.l$2 + (4194304.0 * this.m$2)) + (1.7592186044416E13 * this.h$2))))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$div__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return ScalaJS.as.sjsr_RuntimeLong(this.scala$scalajs$runtime$RuntimeLong$$divMod__sjsr_RuntimeLong__sjs_js_Array(y)[0])
});
ScalaJS.c.sjsr_RuntimeLong.prototype.numberOfLeadingZeros__I = (function() {
  return ((this.h$2 !== 0) ? (((-12) + ScalaJS.m.jl_Integer$().numberOfLeadingZeros__I__I(this.h$2)) | 0) : ((this.m$2 !== 0) ? ((10 + ScalaJS.m.jl_Integer$().numberOfLeadingZeros__I__I(this.m$2)) | 0) : ((32 + ScalaJS.m.jl_Integer$().numberOfLeadingZeros__I__I(this.l$2)) | 0)))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toByte__B = (function() {
  return ((this.toInt__I() << 24) >> 24)
});
ScalaJS.c.sjsr_RuntimeLong.prototype.doubleValue__D = (function() {
  return this.toDouble__D()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.hashCode__I = (function() {
  return this.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong(this.$$greater$greater$greater__I__sjsr_RuntimeLong(32)).toInt__I()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.intValue__I = (function() {
  return this.toInt__I()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.unary$und$tilde__sjsr_RuntimeLong = (function() {
  var l = (~this.l$2);
  var m = (~this.m$2);
  var h = (~this.h$2);
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((4194303 & l), (4194303 & m), (1048575 & h))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.compareTo__jl_Long__I = (function(that) {
  return this.compareTo__sjsr_RuntimeLong__I(ScalaJS.as.sjsr_RuntimeLong(that))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.floatValue__F = (function() {
  return this.toFloat__F()
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$minus__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return this.$$plus__sjsr_RuntimeLong__sjsr_RuntimeLong(y.unary$und$minus__sjsr_RuntimeLong())
});
ScalaJS.c.sjsr_RuntimeLong.prototype.toFloat__F = (function() {
  return ScalaJS.fround(this.toDouble__D())
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$$up__sjsr_RuntimeLong__sjsr_RuntimeLong = (function(y) {
  return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I((this.l$2 ^ y.l$2), (this.m$2 ^ y.m$2), (this.h$2 ^ y.h$2))
});
ScalaJS.c.sjsr_RuntimeLong.prototype.equals__sjsr_RuntimeLong__Z = (function(y) {
  return (((this.l$2 === y.l$2) && (this.m$2 === y.m$2)) && (this.h$2 === y.h$2))
});
ScalaJS.is.sjsr_RuntimeLong = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjsr_RuntimeLong)))
});
ScalaJS.as.sjsr_RuntimeLong = (function(obj) {
  return ((ScalaJS.is.sjsr_RuntimeLong(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.runtime.RuntimeLong"))
});
ScalaJS.isArrayOf.sjsr_RuntimeLong = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjsr_RuntimeLong)))
});
ScalaJS.asArrayOf.sjsr_RuntimeLong = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjsr_RuntimeLong(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.runtime.RuntimeLong;", depth))
});
ScalaJS.d.sjsr_RuntimeLong = new ScalaJS.ClassTypeData({
  sjsr_RuntimeLong: 0
}, false, "scala.scalajs.runtime.RuntimeLong", {
  sjsr_RuntimeLong: 1,
  jl_Number: 1,
  O: 1,
  jl_Comparable: 1
});
ScalaJS.c.sjsr_RuntimeLong.prototype.$classData = ScalaJS.d.sjsr_RuntimeLong;
/** @constructor */
ScalaJS.c.sjsr_RuntimeLong$ = (function() {
  ScalaJS.c.O.call(this);
  this.BITS$1 = 0;
  this.BITS01$1 = 0;
  this.BITS2$1 = 0;
  this.MASK$1 = 0;
  this.MASK$und2$1 = 0;
  this.SIGN$undBIT$1 = 0;
  this.SIGN$undBIT$undVALUE$1 = 0;
  this.TWO$undPWR$und15$undDBL$1 = 0.0;
  this.TWO$undPWR$und16$undDBL$1 = 0.0;
  this.TWO$undPWR$und22$undDBL$1 = 0.0;
  this.TWO$undPWR$und31$undDBL$1 = 0.0;
  this.TWO$undPWR$und32$undDBL$1 = 0.0;
  this.TWO$undPWR$und44$undDBL$1 = 0.0;
  this.TWO$undPWR$und63$undDBL$1 = 0.0;
  this.Zero$1 = null;
  this.One$1 = null;
  this.MinusOne$1 = null;
  this.MinValue$1 = null;
  this.MaxValue$1 = null;
  this.TenPow9$1 = null
});
ScalaJS.c.sjsr_RuntimeLong$.prototype = new ScalaJS.h.O();
ScalaJS.c.sjsr_RuntimeLong$.prototype.constructor = ScalaJS.c.sjsr_RuntimeLong$;
/** @constructor */
ScalaJS.h.sjsr_RuntimeLong$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_RuntimeLong$.prototype = ScalaJS.c.sjsr_RuntimeLong$.prototype;
ScalaJS.c.sjsr_RuntimeLong$.prototype.init___ = (function() {
  ScalaJS.n.sjsr_RuntimeLong$ = this;
  this.Zero$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, 0, 0);
  this.One$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(1, 0, 0);
  this.MinusOne$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 4194303, 1048575);
  this.MinValue$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(0, 0, 524288);
  this.MaxValue$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(4194303, 4194303, 524287);
  this.TenPow9$1 = new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(1755648, 238, 0);
  return this
});
ScalaJS.c.sjsr_RuntimeLong$.prototype.Zero__sjsr_RuntimeLong = (function() {
  return this.Zero$1
});
ScalaJS.c.sjsr_RuntimeLong$.prototype.fromDouble__D__sjsr_RuntimeLong = (function(value) {
  if ((value !== value)) {
    return this.Zero$1
  } else if ((value < (-9.223372036854776E18))) {
    return this.MinValue$1
  } else if ((value >= 9.223372036854776E18)) {
    return this.MaxValue$1
  } else if ((value < 0)) {
    return this.fromDouble__D__sjsr_RuntimeLong((-value)).unary$und$minus__sjsr_RuntimeLong()
  } else {
    var acc = value;
    var a2 = ((acc >= 1.7592186044416E13) ? ((acc / 1.7592186044416E13) | 0) : 0);
    acc = (acc - (1.7592186044416E13 * a2));
    var a1 = ((acc >= 4194304.0) ? ((acc / 4194304.0) | 0) : 0);
    acc = (acc - (4194304.0 * a1));
    var a0 = (acc | 0);
    return new ScalaJS.c.sjsr_RuntimeLong().init___I__I__I(a0, a1, a2)
  }
});
ScalaJS.d.sjsr_RuntimeLong$ = new ScalaJS.ClassTypeData({
  sjsr_RuntimeLong$: 0
}, false, "scala.scalajs.runtime.RuntimeLong$", {
  sjsr_RuntimeLong$: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sjsr_RuntimeLong$.prototype.$classData = ScalaJS.d.sjsr_RuntimeLong$;
ScalaJS.n.sjsr_RuntimeLong$ = (void 0);
ScalaJS.m.sjsr_RuntimeLong$ = (function() {
  if ((!ScalaJS.n.sjsr_RuntimeLong$)) {
    ScalaJS.n.sjsr_RuntimeLong$ = new ScalaJS.c.sjsr_RuntimeLong$().init___()
  };
  return ScalaJS.n.sjsr_RuntimeLong$
});
/** @constructor */
ScalaJS.c.Ljava_io_FilterOutputStream = (function() {
  ScalaJS.c.Ljava_io_OutputStream.call(this);
  this.out$2 = null
});
ScalaJS.c.Ljava_io_FilterOutputStream.prototype = new ScalaJS.h.Ljava_io_OutputStream();
ScalaJS.c.Ljava_io_FilterOutputStream.prototype.constructor = ScalaJS.c.Ljava_io_FilterOutputStream;
/** @constructor */
ScalaJS.h.Ljava_io_FilterOutputStream = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljava_io_FilterOutputStream.prototype = ScalaJS.c.Ljava_io_FilterOutputStream.prototype;
ScalaJS.c.Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  this.out$2 = out;
  return this
});
ScalaJS.is.T = (function(obj) {
  return ((typeof obj) === "string")
});
ScalaJS.as.T = (function(obj) {
  return ((ScalaJS.is.T(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.lang.String"))
});
ScalaJS.isArrayOf.T = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T)))
});
ScalaJS.asArrayOf.T = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.T(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.lang.String;", depth))
});
ScalaJS.d.T = new ScalaJS.ClassTypeData({
  T: 0
}, false, "java.lang.String", {
  T: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  jl_CharSequence: 1,
  jl_Comparable: 1
}, (void 0), ScalaJS.is.T);
/** @constructor */
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function() {
  ScalaJS.c.Ljava_io_OutputStream.call(this)
});
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = new ScalaJS.h.Ljava_io_OutputStream();
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.constructor = ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
ScalaJS.h.jl_JSConsoleBasedPrintStream$DummyOutputStream = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype = ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype;
ScalaJS.d.jl_JSConsoleBasedPrintStream$DummyOutputStream = new ScalaJS.ClassTypeData({
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream$DummyOutputStream", {
  jl_JSConsoleBasedPrintStream$DummyOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1
});
ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream.prototype.$classData = ScalaJS.d.jl_JSConsoleBasedPrintStream$DummyOutputStream;
/** @constructor */
ScalaJS.c.jl_RuntimeException = (function() {
  ScalaJS.c.jl_Exception.call(this)
});
ScalaJS.c.jl_RuntimeException.prototype = new ScalaJS.h.jl_Exception();
ScalaJS.c.jl_RuntimeException.prototype.constructor = ScalaJS.c.jl_RuntimeException;
/** @constructor */
ScalaJS.h.jl_RuntimeException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_RuntimeException.prototype = ScalaJS.c.jl_RuntimeException.prototype;
ScalaJS.c.jl_RuntimeException.prototype.init___ = (function() {
  ScalaJS.c.jl_RuntimeException.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
ScalaJS.c.jl_RuntimeException.prototype.init___T = (function(s) {
  ScalaJS.c.jl_RuntimeException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
/** @constructor */
ScalaJS.c.jl_StringBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.content$1 = null
});
ScalaJS.c.jl_StringBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.jl_StringBuilder.prototype.constructor = ScalaJS.c.jl_StringBuilder;
/** @constructor */
ScalaJS.h.jl_StringBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_StringBuilder.prototype = ScalaJS.c.jl_StringBuilder.prototype;
ScalaJS.c.jl_StringBuilder.prototype.append__T__jl_StringBuilder = (function(s) {
  this.content$1 = (("" + this.content$1) + ((s === null) ? "null" : s));
  return this
});
ScalaJS.c.jl_StringBuilder.prototype.toString__T = (function() {
  return this.content$1
});
ScalaJS.c.jl_StringBuilder.prototype.init___I = (function(initialCapacity) {
  ScalaJS.c.jl_StringBuilder.prototype.init___T.call(this, "");
  return this
});
ScalaJS.c.jl_StringBuilder.prototype.append__C__jl_StringBuilder = (function(c) {
  return this.append__T__jl_StringBuilder(ScalaJS.as.T(ScalaJS.g["String"]["fromCharCode"](c)))
});
ScalaJS.c.jl_StringBuilder.prototype.init___T = (function(content) {
  this.content$1 = content;
  return this
});
ScalaJS.d.jl_StringBuilder = new ScalaJS.ClassTypeData({
  jl_StringBuilder: 0
}, false, "java.lang.StringBuilder", {
  jl_StringBuilder: 1,
  O: 1,
  jl_CharSequence: 1,
  jl_Appendable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_StringBuilder.prototype.$classData = ScalaJS.d.jl_StringBuilder;
/** @constructor */
ScalaJS.c.s_Array$ = (function() {
  ScalaJS.c.s_FallbackArrayBuilding.call(this);
  this.emptyBooleanArray$2 = null;
  this.emptyByteArray$2 = null;
  this.emptyCharArray$2 = null;
  this.emptyDoubleArray$2 = null;
  this.emptyFloatArray$2 = null;
  this.emptyIntArray$2 = null;
  this.emptyLongArray$2 = null;
  this.emptyShortArray$2 = null;
  this.emptyObjectArray$2 = null
});
ScalaJS.c.s_Array$.prototype = new ScalaJS.h.s_FallbackArrayBuilding();
ScalaJS.c.s_Array$.prototype.constructor = ScalaJS.c.s_Array$;
/** @constructor */
ScalaJS.h.s_Array$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_Array$.prototype = ScalaJS.c.s_Array$.prototype;
ScalaJS.c.s_Array$.prototype.init___ = (function() {
  ScalaJS.n.s_Array$ = this;
  this.emptyBooleanArray$2 = ScalaJS.newArrayObject(ScalaJS.d.Z.getArrayOf(), [0]);
  this.emptyByteArray$2 = ScalaJS.newArrayObject(ScalaJS.d.B.getArrayOf(), [0]);
  this.emptyCharArray$2 = ScalaJS.newArrayObject(ScalaJS.d.C.getArrayOf(), [0]);
  this.emptyDoubleArray$2 = ScalaJS.newArrayObject(ScalaJS.d.D.getArrayOf(), [0]);
  this.emptyFloatArray$2 = ScalaJS.newArrayObject(ScalaJS.d.F.getArrayOf(), [0]);
  this.emptyIntArray$2 = ScalaJS.newArrayObject(ScalaJS.d.I.getArrayOf(), [0]);
  this.emptyLongArray$2 = ScalaJS.newArrayObject(ScalaJS.d.J.getArrayOf(), [0]);
  this.emptyShortArray$2 = ScalaJS.newArrayObject(ScalaJS.d.S.getArrayOf(), [0]);
  this.emptyObjectArray$2 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [0]);
  return this
});
ScalaJS.c.s_Array$.prototype.slowcopy__p2__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var i = srcPos;
  var j = destPos;
  var srcUntil = ((srcPos + length) | 0);
  while ((i < srcUntil)) {
    ScalaJS.m.sr_ScalaRunTime$().array$undupdate__O__I__O__V(dest, j, ScalaJS.m.sr_ScalaRunTime$().array$undapply__O__I__O(src, i));
    i = ((1 + i) | 0);
    j = ((1 + j) | 0)
  }
});
ScalaJS.c.s_Array$.prototype.copy__O__I__O__I__I__V = (function(src, srcPos, dest, destPos, length) {
  var srcClass = ScalaJS.objectGetClass(src);
  if ((srcClass.isArray__Z() && ScalaJS.objectGetClass(dest).isAssignableFrom__jl_Class__Z(srcClass))) {
    ScalaJS.systemArraycopy(src, srcPos, dest, destPos, length)
  } else {
    this.slowcopy__p2__O__I__O__I__I__V(src, srcPos, dest, destPos, length)
  }
});
ScalaJS.d.s_Array$ = new ScalaJS.ClassTypeData({
  s_Array$: 0
}, false, "scala.Array$", {
  s_Array$: 1,
  s_FallbackArrayBuilding: 1,
  O: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_Array$.prototype.$classData = ScalaJS.d.s_Array$;
ScalaJS.n.s_Array$ = (void 0);
ScalaJS.m.s_Array$ = (function() {
  if ((!ScalaJS.n.s_Array$)) {
    ScalaJS.n.s_Array$ = new ScalaJS.c.s_Array$().init___()
  };
  return ScalaJS.n.s_Array$
});
/** @constructor */
ScalaJS.c.s_math_Equiv$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Equiv$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Equiv$.prototype.constructor = ScalaJS.c.s_math_Equiv$;
/** @constructor */
ScalaJS.h.s_math_Equiv$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Equiv$.prototype = ScalaJS.c.s_math_Equiv$.prototype;
ScalaJS.c.s_math_Equiv$.prototype.init___ = (function() {
  ScalaJS.n.s_math_Equiv$ = this;
  return this
});
ScalaJS.d.s_math_Equiv$ = new ScalaJS.ClassTypeData({
  s_math_Equiv$: 0
}, false, "scala.math.Equiv$", {
  s_math_Equiv$: 1,
  O: 1,
  s_math_LowPriorityEquiv: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Equiv$.prototype.$classData = ScalaJS.d.s_math_Equiv$;
ScalaJS.n.s_math_Equiv$ = (void 0);
ScalaJS.m.s_math_Equiv$ = (function() {
  if ((!ScalaJS.n.s_math_Equiv$)) {
    ScalaJS.n.s_math_Equiv$ = new ScalaJS.c.s_math_Equiv$().init___()
  };
  return ScalaJS.n.s_math_Equiv$
});
/** @constructor */
ScalaJS.c.s_math_Ordering$ = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.s_math_Ordering$.prototype = new ScalaJS.h.O();
ScalaJS.c.s_math_Ordering$.prototype.constructor = ScalaJS.c.s_math_Ordering$;
/** @constructor */
ScalaJS.h.s_math_Ordering$ = (function() {
  /*<skip>*/
});
ScalaJS.h.s_math_Ordering$.prototype = ScalaJS.c.s_math_Ordering$.prototype;
ScalaJS.c.s_math_Ordering$.prototype.init___ = (function() {
  ScalaJS.n.s_math_Ordering$ = this;
  return this
});
ScalaJS.d.s_math_Ordering$ = new ScalaJS.ClassTypeData({
  s_math_Ordering$: 0
}, false, "scala.math.Ordering$", {
  s_math_Ordering$: 1,
  O: 1,
  s_math_LowPriorityOrderingImplicits: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_math_Ordering$.prototype.$classData = ScalaJS.d.s_math_Ordering$;
ScalaJS.n.s_math_Ordering$ = (void 0);
ScalaJS.m.s_math_Ordering$ = (function() {
  if ((!ScalaJS.n.s_math_Ordering$)) {
    ScalaJS.n.s_math_Ordering$ = new ScalaJS.c.s_math_Ordering$().init___()
  };
  return ScalaJS.n.s_math_Ordering$
});
/** @constructor */
ScalaJS.c.sc_AbstractIterator = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_AbstractIterator.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_AbstractIterator.prototype.constructor = ScalaJS.c.sc_AbstractIterator;
/** @constructor */
ScalaJS.h.sc_AbstractIterator = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractIterator.prototype = ScalaJS.c.sc_AbstractIterator.prototype;
ScalaJS.c.sc_AbstractIterator.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sc_AbstractIterator.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sc_AbstractIterator.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_Iterator$class__isEmpty__sc_Iterator__Z(this)
});
ScalaJS.c.sc_AbstractIterator.prototype.toString__T = (function() {
  return ScalaJS.s.sc_Iterator$class__toString__sc_Iterator__T(this)
});
ScalaJS.c.sc_AbstractIterator.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this, f)
});
ScalaJS.c.sc_AbstractIterator.prototype.toStream__sci_Stream = (function() {
  return ScalaJS.s.sc_Iterator$class__toStream__sc_Iterator__sci_Stream(this)
});
ScalaJS.c.sc_AbstractIterator.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
/** @constructor */
ScalaJS.c.scm_GrowingBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.empty$1 = null;
  this.elems$1 = null
});
ScalaJS.c.scm_GrowingBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_GrowingBuilder.prototype.constructor = ScalaJS.c.scm_GrowingBuilder;
/** @constructor */
ScalaJS.h.scm_GrowingBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_GrowingBuilder.prototype = ScalaJS.c.scm_GrowingBuilder.prototype;
ScalaJS.c.scm_GrowingBuilder.prototype.init___scg_Growable = (function(empty) {
  this.empty$1 = empty;
  this.elems$1 = empty;
  return this
});
ScalaJS.c.scm_GrowingBuilder.prototype.$$plus$eq__O__scm_GrowingBuilder = (function(x) {
  this.elems$1.$$plus$eq__O__scg_Growable(x);
  return this
});
ScalaJS.c.scm_GrowingBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
ScalaJS.c.scm_GrowingBuilder.prototype.result__O = (function() {
  return this.elems$1
});
ScalaJS.c.scm_GrowingBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_GrowingBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_GrowingBuilder(elem)
});
ScalaJS.c.scm_GrowingBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_GrowingBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.d.scm_GrowingBuilder = new ScalaJS.ClassTypeData({
  scm_GrowingBuilder: 0
}, false, "scala.collection.mutable.GrowingBuilder", {
  scm_GrowingBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
ScalaJS.c.scm_GrowingBuilder.prototype.$classData = ScalaJS.d.scm_GrowingBuilder;
/** @constructor */
ScalaJS.c.scm_LazyBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.parts$1 = null
});
ScalaJS.c.scm_LazyBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_LazyBuilder.prototype.constructor = ScalaJS.c.scm_LazyBuilder;
/** @constructor */
ScalaJS.h.scm_LazyBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_LazyBuilder.prototype = ScalaJS.c.scm_LazyBuilder.prototype;
ScalaJS.c.scm_LazyBuilder.prototype.init___ = (function() {
  this.parts$1 = new ScalaJS.c.scm_ListBuffer().init___();
  return this
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder = (function(xs) {
  this.parts$1.$$plus$eq__O__scm_ListBuffer(xs);
  return this
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$eq__O__scm_LazyBuilder = (function(x) {
  var jsx$1 = this.parts$1;
  ScalaJS.m.sci_List$();
  var xs = new ScalaJS.c.sjs_js_WrappedArray().init___sjs_js_Array([x]);
  var this$2 = ScalaJS.m.sci_List$();
  var cbf = this$2.ReusableCBFInstance$2;
  jsx$1.$$plus$eq__O__scm_ListBuffer(ScalaJS.as.sci_List(ScalaJS.s.sc_TraversableLike$class__to__sc_TraversableLike__scg_CanBuildFrom__O(xs, cbf)));
  return this
});
ScalaJS.c.scm_LazyBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_LazyBuilder(elem)
});
ScalaJS.c.scm_LazyBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_LazyBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_LazyBuilder(xs)
});
/** @constructor */
ScalaJS.c.Ljs_webapp_Snake$Point2 = (function() {
  ScalaJS.c.O.call(this);
  this.x$1 = 0;
  this.y$1 = 0
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype = new ScalaJS.h.O();
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.constructor = ScalaJS.c.Ljs_webapp_Snake$Point2;
/** @constructor */
ScalaJS.h.Ljs_webapp_Snake$Point2 = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljs_webapp_Snake$Point2.prototype = ScalaJS.c.Ljs_webapp_Snake$Point2.prototype;
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.productPrefix__T = (function() {
  return "Point2"
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.productArity__I = (function() {
  return 2
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.Ljs_webapp_Snake$Point2(x$1)) {
    var Point2$1 = ScalaJS.as.Ljs_webapp_Snake$Point2(x$1);
    return ((this.x$1 === Point2$1.x$1) && (this.y$1 === Point2$1.y$1))
  } else {
    return false
  }
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.x$1;
        break
      };
    case 1:
      {
        return this.y$1;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.init___I__I = (function(x, y) {
  this.x$1 = x;
  this.y$1 = y;
  return this
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.plus__Ljs_webapp_Snake$Point2__Ljs_webapp_Snake$Point2 = (function(s) {
  return new ScalaJS.c.Ljs_webapp_Snake$Point2().init___I__I(((this.x$1 + s.x$1) | 0), ((this.y$1 + s.y$1) | 0))
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.hashCode__I = (function() {
  var acc = (-889275714);
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, this.x$1);
  acc = ScalaJS.m.sr_Statics$().mix__I__I__I(acc, this.y$1);
  return ScalaJS.m.sr_Statics$().finalizeHash__I__I__I(acc, 2)
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.Ljs_webapp_Snake$Point2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljs_webapp_Snake$Point2)))
});
ScalaJS.as.Ljs_webapp_Snake$Point2 = (function(obj) {
  return ((ScalaJS.is.Ljs_webapp_Snake$Point2(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "js.webapp.Snake$Point2"))
});
ScalaJS.isArrayOf.Ljs_webapp_Snake$Point2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljs_webapp_Snake$Point2)))
});
ScalaJS.asArrayOf.Ljs_webapp_Snake$Point2 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Ljs_webapp_Snake$Point2(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljs.webapp.Snake$Point2;", depth))
});
ScalaJS.d.Ljs_webapp_Snake$Point2 = new ScalaJS.ClassTypeData({
  Ljs_webapp_Snake$Point2: 0
}, false, "js.webapp.Snake$Point2", {
  Ljs_webapp_Snake$Point2: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.Ljs_webapp_Snake$Point2.prototype.$classData = ScalaJS.d.Ljs_webapp_Snake$Point2;
/** @constructor */
ScalaJS.c.jl_ArithmeticException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_ArithmeticException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_ArithmeticException.prototype.constructor = ScalaJS.c.jl_ArithmeticException;
/** @constructor */
ScalaJS.h.jl_ArithmeticException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_ArithmeticException.prototype = ScalaJS.c.jl_ArithmeticException.prototype;
ScalaJS.d.jl_ArithmeticException = new ScalaJS.ClassTypeData({
  jl_ArithmeticException: 0
}, false, "java.lang.ArithmeticException", {
  jl_ArithmeticException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_ArithmeticException.prototype.$classData = ScalaJS.d.jl_ArithmeticException;
/** @constructor */
ScalaJS.c.jl_ClassCastException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_ClassCastException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_ClassCastException.prototype.constructor = ScalaJS.c.jl_ClassCastException;
/** @constructor */
ScalaJS.h.jl_ClassCastException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_ClassCastException.prototype = ScalaJS.c.jl_ClassCastException.prototype;
ScalaJS.d.jl_ClassCastException = new ScalaJS.ClassTypeData({
  jl_ClassCastException: 0
}, false, "java.lang.ClassCastException", {
  jl_ClassCastException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_ClassCastException.prototype.$classData = ScalaJS.d.jl_ClassCastException;
/** @constructor */
ScalaJS.c.jl_IllegalArgumentException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_IllegalArgumentException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_IllegalArgumentException.prototype.constructor = ScalaJS.c.jl_IllegalArgumentException;
/** @constructor */
ScalaJS.h.jl_IllegalArgumentException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_IllegalArgumentException.prototype = ScalaJS.c.jl_IllegalArgumentException.prototype;
ScalaJS.c.jl_IllegalArgumentException.prototype.init___ = (function() {
  ScalaJS.c.jl_IllegalArgumentException.prototype.init___T__jl_Throwable.call(this, null, null);
  return this
});
ScalaJS.c.jl_IllegalArgumentException.prototype.init___T = (function(s) {
  ScalaJS.c.jl_IllegalArgumentException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
ScalaJS.d.jl_IllegalArgumentException = new ScalaJS.ClassTypeData({
  jl_IllegalArgumentException: 0
}, false, "java.lang.IllegalArgumentException", {
  jl_IllegalArgumentException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_IllegalArgumentException.prototype.$classData = ScalaJS.d.jl_IllegalArgumentException;
/** @constructor */
ScalaJS.c.jl_IndexOutOfBoundsException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_IndexOutOfBoundsException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_IndexOutOfBoundsException.prototype.constructor = ScalaJS.c.jl_IndexOutOfBoundsException;
/** @constructor */
ScalaJS.h.jl_IndexOutOfBoundsException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_IndexOutOfBoundsException.prototype = ScalaJS.c.jl_IndexOutOfBoundsException.prototype;
ScalaJS.d.jl_IndexOutOfBoundsException = new ScalaJS.ClassTypeData({
  jl_IndexOutOfBoundsException: 0
}, false, "java.lang.IndexOutOfBoundsException", {
  jl_IndexOutOfBoundsException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_IndexOutOfBoundsException.prototype.$classData = ScalaJS.d.jl_IndexOutOfBoundsException;
/** @constructor */
ScalaJS.c.jl_NullPointerException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_NullPointerException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_NullPointerException.prototype.constructor = ScalaJS.c.jl_NullPointerException;
/** @constructor */
ScalaJS.h.jl_NullPointerException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_NullPointerException.prototype = ScalaJS.c.jl_NullPointerException.prototype;
ScalaJS.c.jl_NullPointerException.prototype.init___ = (function() {
  ScalaJS.c.jl_NullPointerException.prototype.init___T.call(this, null);
  return this
});
ScalaJS.d.jl_NullPointerException = new ScalaJS.ClassTypeData({
  jl_NullPointerException: 0
}, false, "java.lang.NullPointerException", {
  jl_NullPointerException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_NullPointerException.prototype.$classData = ScalaJS.d.jl_NullPointerException;
/** @constructor */
ScalaJS.c.jl_UnsupportedOperationException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.jl_UnsupportedOperationException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.jl_UnsupportedOperationException.prototype.constructor = ScalaJS.c.jl_UnsupportedOperationException;
/** @constructor */
ScalaJS.h.jl_UnsupportedOperationException = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_UnsupportedOperationException.prototype = ScalaJS.c.jl_UnsupportedOperationException.prototype;
ScalaJS.c.jl_UnsupportedOperationException.prototype.init___T = (function(s) {
  ScalaJS.c.jl_UnsupportedOperationException.prototype.init___T__jl_Throwable.call(this, s, null);
  return this
});
ScalaJS.d.jl_UnsupportedOperationException = new ScalaJS.ClassTypeData({
  jl_UnsupportedOperationException: 0
}, false, "java.lang.UnsupportedOperationException", {
  jl_UnsupportedOperationException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.jl_UnsupportedOperationException.prototype.$classData = ScalaJS.d.jl_UnsupportedOperationException;
/** @constructor */
ScalaJS.c.ju_NoSuchElementException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this)
});
ScalaJS.c.ju_NoSuchElementException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.ju_NoSuchElementException.prototype.constructor = ScalaJS.c.ju_NoSuchElementException;
/** @constructor */
ScalaJS.h.ju_NoSuchElementException = (function() {
  /*<skip>*/
});
ScalaJS.h.ju_NoSuchElementException.prototype = ScalaJS.c.ju_NoSuchElementException.prototype;
ScalaJS.c.ju_NoSuchElementException.prototype.init___ = (function() {
  ScalaJS.c.ju_NoSuchElementException.prototype.init___T.call(this, null);
  return this
});
ScalaJS.d.ju_NoSuchElementException = new ScalaJS.ClassTypeData({
  ju_NoSuchElementException: 0
}, false, "java.util.NoSuchElementException", {
  ju_NoSuchElementException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.ju_NoSuchElementException.prototype.$classData = ScalaJS.d.ju_NoSuchElementException;
/** @constructor */
ScalaJS.c.s_MatchError = (function() {
  ScalaJS.c.jl_RuntimeException.call(this);
  this.obj$4 = null;
  this.objString$4 = null;
  this.bitmap$0$4 = false
});
ScalaJS.c.s_MatchError.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.s_MatchError.prototype.constructor = ScalaJS.c.s_MatchError;
/** @constructor */
ScalaJS.h.s_MatchError = (function() {
  /*<skip>*/
});
ScalaJS.h.s_MatchError.prototype = ScalaJS.c.s_MatchError.prototype;
ScalaJS.c.s_MatchError.prototype.objString$lzycompute__p4__T = (function() {
  if ((!this.bitmap$0$4)) {
    this.objString$4 = ((this.obj$4 === null) ? "null" : this.liftedTree1$1__p4__T());
    this.bitmap$0$4 = true
  };
  return this.objString$4
});
ScalaJS.c.s_MatchError.prototype.ofClass$1__p4__T = (function() {
  return ("of class " + ScalaJS.objectGetClass(this.obj$4).getName__T())
});
ScalaJS.c.s_MatchError.prototype.liftedTree1$1__p4__T = (function() {
  try {
    return (((ScalaJS.objectToString(this.obj$4) + " (") + this.ofClass$1__p4__T()) + ")")
  } catch (e) {
    var e$2 = ScalaJS.m.sjsr_package$().wrapJavaScriptException__O__jl_Throwable(e);
    if ((e$2 !== null)) {
      return ("an instance " + this.ofClass$1__p4__T())
    } else {
      throw e
    }
  }
});
ScalaJS.c.s_MatchError.prototype.getMessage__T = (function() {
  return this.objString__p4__T()
});
ScalaJS.c.s_MatchError.prototype.objString__p4__T = (function() {
  return ((!this.bitmap$0$4) ? this.objString$lzycompute__p4__T() : this.objString$4)
});
ScalaJS.c.s_MatchError.prototype.init___O = (function(obj) {
  this.obj$4 = obj;
  ScalaJS.c.jl_RuntimeException.prototype.init___.call(this);
  return this
});
ScalaJS.d.s_MatchError = new ScalaJS.ClassTypeData({
  s_MatchError: 0
}, false, "scala.MatchError", {
  s_MatchError: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_MatchError.prototype.$classData = ScalaJS.d.s_MatchError;
/** @constructor */
ScalaJS.c.s_util_control_BreakControl = (function() {
  ScalaJS.c.jl_Throwable.call(this)
});
ScalaJS.c.s_util_control_BreakControl.prototype = new ScalaJS.h.jl_Throwable();
ScalaJS.c.s_util_control_BreakControl.prototype.constructor = ScalaJS.c.s_util_control_BreakControl;
/** @constructor */
ScalaJS.h.s_util_control_BreakControl = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_control_BreakControl.prototype = ScalaJS.c.s_util_control_BreakControl.prototype;
ScalaJS.c.s_util_control_BreakControl.prototype.init___ = (function() {
  ScalaJS.c.jl_Throwable.prototype.init___.call(this);
  return this
});
ScalaJS.c.s_util_control_BreakControl.prototype.fillInStackTrace__jl_Throwable = (function() {
  return ScalaJS.s.s_util_control_NoStackTrace$class__fillInStackTrace__s_util_control_NoStackTrace__jl_Throwable(this)
});
ScalaJS.c.s_util_control_BreakControl.prototype.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable = (function() {
  return ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
ScalaJS.d.s_util_control_BreakControl = new ScalaJS.ClassTypeData({
  s_util_control_BreakControl: 0
}, false, "scala.util.control.BreakControl", {
  s_util_control_BreakControl: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
ScalaJS.c.s_util_control_BreakControl.prototype.$classData = ScalaJS.d.s_util_control_BreakControl;
ScalaJS.is.sc_GenTraversable = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenTraversable)))
});
ScalaJS.as.sc_GenTraversable = (function(obj) {
  return ((ScalaJS.is.sc_GenTraversable(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenTraversable"))
});
ScalaJS.isArrayOf.sc_GenTraversable = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenTraversable)))
});
ScalaJS.asArrayOf.sc_GenTraversable = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenTraversable(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenTraversable;", depth))
});
/** @constructor */
ScalaJS.c.sc_Iterable$ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this)
});
ScalaJS.c.sc_Iterable$.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.sc_Iterable$.prototype.constructor = ScalaJS.c.sc_Iterable$;
/** @constructor */
ScalaJS.h.sc_Iterable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterable$.prototype = ScalaJS.c.sc_Iterable$.prototype;
ScalaJS.c.sc_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_Iterable$();
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sc_Iterable$ = new ScalaJS.ClassTypeData({
  sc_Iterable$: 0
}, false, "scala.collection.Iterable$", {
  sc_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sc_Iterable$.prototype.$classData = ScalaJS.d.sc_Iterable$;
ScalaJS.n.sc_Iterable$ = (void 0);
ScalaJS.m.sc_Iterable$ = (function() {
  if ((!ScalaJS.n.sc_Iterable$)) {
    ScalaJS.n.sc_Iterable$ = new ScalaJS.c.sc_Iterable$().init___()
  };
  return ScalaJS.n.sc_Iterable$
});
/** @constructor */
ScalaJS.c.sc_Iterator$$anon$2 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this)
});
ScalaJS.c.sc_Iterator$$anon$2.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_Iterator$$anon$2.prototype.constructor = ScalaJS.c.sc_Iterator$$anon$2;
/** @constructor */
ScalaJS.h.sc_Iterator$$anon$2 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Iterator$$anon$2.prototype = ScalaJS.c.sc_Iterator$$anon$2.prototype;
ScalaJS.c.sc_Iterator$$anon$2.prototype.next__O = (function() {
  this.next__sr_Nothing$()
});
ScalaJS.c.sc_Iterator$$anon$2.prototype.next__sr_Nothing$ = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("next on empty iterator")
});
ScalaJS.c.sc_Iterator$$anon$2.prototype.hasNext__Z = (function() {
  return false
});
ScalaJS.d.sc_Iterator$$anon$2 = new ScalaJS.ClassTypeData({
  sc_Iterator$$anon$2: 0
}, false, "scala.collection.Iterator$$anon$2", {
  sc_Iterator$$anon$2: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sc_Iterator$$anon$2.prototype.$classData = ScalaJS.d.sc_Iterator$$anon$2;
/** @constructor */
ScalaJS.c.sc_LinearSeqLike$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.these$2 = null
});
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.constructor = ScalaJS.c.sc_LinearSeqLike$$anon$1;
/** @constructor */
ScalaJS.h.sc_LinearSeqLike$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_LinearSeqLike$$anon$1.prototype = ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype;
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.init___sc_LinearSeqLike = (function($$outer) {
  this.these$2 = $$outer;
  return this
});
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.next__O = (function() {
  if (this.hasNext__Z()) {
    var result = this.these$2.head__O();
    this.these$2 = ScalaJS.as.sc_LinearSeqLike(this.these$2.tail__O());
    return result
  } else {
    return ScalaJS.m.sc_Iterator$().empty$1.next__O()
  }
});
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.hasNext__Z = (function() {
  return (!this.these$2.isEmpty__Z())
});
ScalaJS.d.sc_LinearSeqLike$$anon$1 = new ScalaJS.ClassTypeData({
  sc_LinearSeqLike$$anon$1: 0
}, false, "scala.collection.LinearSeqLike$$anon$1", {
  sc_LinearSeqLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sc_LinearSeqLike$$anon$1.prototype.$classData = ScalaJS.d.sc_LinearSeqLike$$anon$1;
/** @constructor */
ScalaJS.c.sc_Traversable$ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this);
  this.breaks$3 = null
});
ScalaJS.c.sc_Traversable$.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.sc_Traversable$.prototype.constructor = ScalaJS.c.sc_Traversable$;
/** @constructor */
ScalaJS.h.sc_Traversable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Traversable$.prototype = ScalaJS.c.sc_Traversable$.prototype;
ScalaJS.c.sc_Traversable$.prototype.init___ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.prototype.init___.call(this);
  ScalaJS.n.sc_Traversable$ = this;
  this.breaks$3 = new ScalaJS.c.s_util_control_Breaks().init___();
  return this
});
ScalaJS.c.sc_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_Traversable$();
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sc_Traversable$ = new ScalaJS.ClassTypeData({
  sc_Traversable$: 0
}, false, "scala.collection.Traversable$", {
  sc_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sc_Traversable$.prototype.$classData = ScalaJS.d.sc_Traversable$;
ScalaJS.n.sc_Traversable$ = (void 0);
ScalaJS.m.sc_Traversable$ = (function() {
  if ((!ScalaJS.n.sc_Traversable$)) {
    ScalaJS.n.sc_Traversable$ = new ScalaJS.c.sc_Traversable$().init___()
  };
  return ScalaJS.n.sc_Traversable$
});
/** @constructor */
ScalaJS.c.sci_Iterable$ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this)
});
ScalaJS.c.sci_Iterable$.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.sci_Iterable$.prototype.constructor = ScalaJS.c.sci_Iterable$;
/** @constructor */
ScalaJS.h.sci_Iterable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Iterable$.prototype = ScalaJS.c.sci_Iterable$.prototype;
ScalaJS.c.sci_Iterable$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sci_Iterable$ = new ScalaJS.ClassTypeData({
  sci_Iterable$: 0
}, false, "scala.collection.immutable.Iterable$", {
  sci_Iterable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sci_Iterable$.prototype.$classData = ScalaJS.d.sci_Iterable$;
ScalaJS.n.sci_Iterable$ = (void 0);
ScalaJS.m.sci_Iterable$ = (function() {
  if ((!ScalaJS.n.sci_Iterable$)) {
    ScalaJS.n.sci_Iterable$ = new ScalaJS.c.sci_Iterable$().init___()
  };
  return ScalaJS.n.sci_Iterable$
});
/** @constructor */
ScalaJS.c.sci_Stream$StreamBuilder = (function() {
  ScalaJS.c.scm_LazyBuilder.call(this)
});
ScalaJS.c.sci_Stream$StreamBuilder.prototype = new ScalaJS.h.scm_LazyBuilder();
ScalaJS.c.sci_Stream$StreamBuilder.prototype.constructor = ScalaJS.c.sci_Stream$StreamBuilder;
/** @constructor */
ScalaJS.h.sci_Stream$StreamBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$StreamBuilder.prototype = ScalaJS.c.sci_Stream$StreamBuilder.prototype;
ScalaJS.c.sci_Stream$StreamBuilder.prototype.result__O = (function() {
  return this.result__sci_Stream()
});
ScalaJS.c.sci_Stream$StreamBuilder.prototype.result__sci_Stream = (function() {
  var this$1 = this.parts$1;
  return ScalaJS.as.sci_Stream(this$1.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream().flatMap__F1__scg_CanBuildFrom__O(new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(x$5$2) {
      var x$5 = ScalaJS.as.sc_TraversableOnce(x$5$2);
      return x$5.toStream__sci_Stream()
    })
  })(this)), (ScalaJS.m.sci_Stream$(), new ScalaJS.c.sci_Stream$StreamCanBuildFrom().init___())))
});
ScalaJS.is.sci_Stream$StreamBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream$StreamBuilder)))
});
ScalaJS.as.sci_Stream$StreamBuilder = (function(obj) {
  return ((ScalaJS.is.sci_Stream$StreamBuilder(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.Stream$StreamBuilder"))
});
ScalaJS.isArrayOf.sci_Stream$StreamBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream$StreamBuilder)))
});
ScalaJS.asArrayOf.sci_Stream$StreamBuilder = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_Stream$StreamBuilder(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.Stream$StreamBuilder;", depth))
});
ScalaJS.d.sci_Stream$StreamBuilder = new ScalaJS.ClassTypeData({
  sci_Stream$StreamBuilder: 0
}, false, "scala.collection.immutable.Stream$StreamBuilder", {
  sci_Stream$StreamBuilder: 1,
  scm_LazyBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1
});
ScalaJS.c.sci_Stream$StreamBuilder.prototype.$classData = ScalaJS.d.sci_Stream$StreamBuilder;
/** @constructor */
ScalaJS.c.sci_StreamIterator = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.these$2 = null
});
ScalaJS.c.sci_StreamIterator.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sci_StreamIterator.prototype.constructor = ScalaJS.c.sci_StreamIterator;
/** @constructor */
ScalaJS.h.sci_StreamIterator = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_StreamIterator.prototype = ScalaJS.c.sci_StreamIterator.prototype;
ScalaJS.c.sci_StreamIterator.prototype.next__O = (function() {
  if (ScalaJS.s.sc_Iterator$class__isEmpty__sc_Iterator__Z(this)) {
    return ScalaJS.m.sc_Iterator$().empty$1.next__O()
  } else {
    var cur = this.these$2.v__sci_Stream();
    var result = cur.head__O();
    this.these$2 = new ScalaJS.c.sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, cur$1) {
      return (function() {
        return ScalaJS.as.sci_Stream(cur$1.tail__O())
      })
    })(this, cur)));
    return result
  }
});
ScalaJS.c.sci_StreamIterator.prototype.init___sci_Stream = (function(self) {
  this.these$2 = new ScalaJS.c.sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, self$1) {
    return (function() {
      return self$1
    })
  })(this, self)));
  return this
});
ScalaJS.c.sci_StreamIterator.prototype.hasNext__Z = (function() {
  var this$1 = this.these$2.v__sci_Stream();
  return ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)
});
ScalaJS.c.sci_StreamIterator.prototype.toStream__sci_Stream = (function() {
  var result = this.these$2.v__sci_Stream();
  this.these$2 = new ScalaJS.c.sci_StreamIterator$LazyCell().init___sci_StreamIterator__F0(this, new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
    return (function() {
      ScalaJS.m.sci_Stream$();
      return ScalaJS.m.sci_Stream$Empty$()
    })
  })(this)));
  return result
});
ScalaJS.d.sci_StreamIterator = new ScalaJS.ClassTypeData({
  sci_StreamIterator: 0
}, false, "scala.collection.immutable.StreamIterator", {
  sci_StreamIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sci_StreamIterator.prototype.$classData = ScalaJS.d.sci_StreamIterator;
/** @constructor */
ScalaJS.c.sci_Traversable$ = (function() {
  ScalaJS.c.scg_GenTraversableFactory.call(this)
});
ScalaJS.c.sci_Traversable$.prototype = new ScalaJS.h.scg_GenTraversableFactory();
ScalaJS.c.sci_Traversable$.prototype.constructor = ScalaJS.c.sci_Traversable$;
/** @constructor */
ScalaJS.h.sci_Traversable$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Traversable$.prototype = ScalaJS.c.sci_Traversable$.prototype;
ScalaJS.c.sci_Traversable$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sci_Traversable$ = new ScalaJS.ClassTypeData({
  sci_Traversable$: 0
}, false, "scala.collection.immutable.Traversable$", {
  sci_Traversable$: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sci_Traversable$.prototype.$classData = ScalaJS.d.sci_Traversable$;
ScalaJS.n.sci_Traversable$ = (void 0);
ScalaJS.m.sci_Traversable$ = (function() {
  if ((!ScalaJS.n.sci_Traversable$)) {
    ScalaJS.n.sci_Traversable$ = new ScalaJS.c.sci_Traversable$().init___()
  };
  return ScalaJS.n.sci_Traversable$
});
/** @constructor */
ScalaJS.c.sci_VectorBuilder = (function() {
  ScalaJS.c.O.call(this);
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  this.depth$1 = 0;
  this.display0$1 = null;
  this.display1$1 = null;
  this.display2$1 = null;
  this.display3$1 = null;
  this.display4$1 = null;
  this.display5$1 = null
});
ScalaJS.c.sci_VectorBuilder.prototype = new ScalaJS.h.O();
ScalaJS.c.sci_VectorBuilder.prototype.constructor = ScalaJS.c.sci_VectorBuilder;
/** @constructor */
ScalaJS.h.sci_VectorBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_VectorBuilder.prototype = ScalaJS.c.sci_VectorBuilder.prototype;
ScalaJS.c.sci_VectorBuilder.prototype.display3__AO = (function() {
  return this.display3$1
});
ScalaJS.c.sci_VectorBuilder.prototype.init___ = (function() {
  this.display0$1 = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [32]);
  this.depth$1 = 1;
  this.blockIndex$1 = 0;
  this.lo$1 = 0;
  return this
});
ScalaJS.c.sci_VectorBuilder.prototype.depth__I = (function() {
  return this.depth$1
});
ScalaJS.c.sci_VectorBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
ScalaJS.c.sci_VectorBuilder.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display0__AO = (function() {
  return this.display0$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display4__AO = (function() {
  return this.display4$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.$$plus$eq__O__sci_VectorBuilder = (function(elem) {
  if ((this.lo$1 >= this.display0$1.u["length"])) {
    var newBlockIndex = ((32 + this.blockIndex$1) | 0);
    var xor = (this.blockIndex$1 ^ newBlockIndex);
    ScalaJS.s.sci_VectorPointer$class__gotoNextBlockStartWritable__sci_VectorPointer__I__I__V(this, newBlockIndex, xor);
    this.blockIndex$1 = newBlockIndex;
    this.lo$1 = 0
  };
  this.display0$1.u[this.lo$1] = elem;
  this.lo$1 = ((1 + this.lo$1) | 0);
  return this
});
ScalaJS.c.sci_VectorBuilder.prototype.result__O = (function() {
  return this.result__sci_Vector()
});
ScalaJS.c.sci_VectorBuilder.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.sci_VectorBuilder.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display1__AO = (function() {
  return this.display1$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display5__AO = (function() {
  return this.display5$1
});
ScalaJS.c.sci_VectorBuilder.prototype.result__sci_Vector = (function() {
  var size = ((this.blockIndex$1 + this.lo$1) | 0);
  if ((size === 0)) {
    var this$1 = ScalaJS.m.sci_Vector$();
    return this$1.NIL$6
  };
  var s = new ScalaJS.c.sci_Vector().init___I__I__I(0, size, 0);
  var depth = this.depth$1;
  ScalaJS.s.sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
  if ((this.depth$1 > 1)) {
    var xor = (((-1) + size) | 0);
    ScalaJS.s.sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V(s, 0, xor)
  };
  return s
});
ScalaJS.c.sci_VectorBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__sci_VectorBuilder(elem)
});
ScalaJS.c.sci_VectorBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.sci_VectorBuilder.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display2__AO = (function() {
  return this.display2$1
});
ScalaJS.c.sci_VectorBuilder.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$1 = x$1
});
ScalaJS.c.sci_VectorBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.as.sci_VectorBuilder(ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
});
ScalaJS.c.sci_VectorBuilder.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$1 = x$1
});
ScalaJS.is.sci_VectorBuilder = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_VectorBuilder)))
});
ScalaJS.as.sci_VectorBuilder = (function(obj) {
  return ((ScalaJS.is.sci_VectorBuilder(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.VectorBuilder"))
});
ScalaJS.isArrayOf.sci_VectorBuilder = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_VectorBuilder)))
});
ScalaJS.asArrayOf.sci_VectorBuilder = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_VectorBuilder(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.VectorBuilder;", depth))
});
ScalaJS.d.sci_VectorBuilder = new ScalaJS.ClassTypeData({
  sci_VectorBuilder: 0
}, false, "scala.collection.immutable.VectorBuilder", {
  sci_VectorBuilder: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  sci_VectorPointer: 1
});
ScalaJS.c.sci_VectorBuilder.prototype.$classData = ScalaJS.d.sci_VectorBuilder;
/** @constructor */
ScalaJS.c.scm_Builder$$anon$1 = (function() {
  ScalaJS.c.O.call(this);
  this.self$1 = null;
  this.f$1$1 = null
});
ScalaJS.c.scm_Builder$$anon$1.prototype = new ScalaJS.h.O();
ScalaJS.c.scm_Builder$$anon$1.prototype.constructor = ScalaJS.c.scm_Builder$$anon$1;
/** @constructor */
ScalaJS.h.scm_Builder$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_Builder$$anon$1.prototype = ScalaJS.c.scm_Builder$$anon$1.prototype;
ScalaJS.c.scm_Builder$$anon$1.prototype.init___scm_Builder__F1 = (function($$outer, f$1) {
  this.f$1$1 = f$1;
  this.self$1 = $$outer;
  return this
});
ScalaJS.c.scm_Builder$$anon$1.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.s_Proxy$class__equals__s_Proxy__O__Z(this, that)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.toString__T = (function() {
  return ScalaJS.s.s_Proxy$class__toString__s_Proxy__T(this)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1 = (function(xs) {
  this.self$1.$$plus$plus$eq__sc_TraversableOnce__scg_Growable(xs);
  return this
});
ScalaJS.c.scm_Builder$$anon$1.prototype.result__O = (function() {
  return this.f$1$1.apply__O__O(this.self$1.result__O())
});
ScalaJS.c.scm_Builder$$anon$1.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundColl) {
  this.self$1.sizeHintBounded__I__sc_TraversableLike__V(size, boundColl)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder$$anon$1 = (function(x) {
  this.self$1.$$plus$eq__O__scm_Builder(x);
  return this
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_Builder$$anon$1(elem)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.hashCode__I = (function() {
  return this.self$1.hashCode__I()
});
ScalaJS.c.scm_Builder$$anon$1.prototype.sizeHint__I__V = (function(size) {
  this.self$1.sizeHint__I__V(size)
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_Builder$$anon$1(xs)
});
ScalaJS.d.scm_Builder$$anon$1 = new ScalaJS.ClassTypeData({
  scm_Builder$$anon$1: 0
}, false, "scala.collection.mutable.Builder$$anon$1", {
  scm_Builder$$anon$1: 1,
  O: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Proxy: 1
});
ScalaJS.c.scm_Builder$$anon$1.prototype.$classData = ScalaJS.d.scm_Builder$$anon$1;
/** @constructor */
ScalaJS.c.scm_LinkedListLike$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.elems$2 = null
});
ScalaJS.c.scm_LinkedListLike$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.scm_LinkedListLike$$anon$1.prototype.constructor = ScalaJS.c.scm_LinkedListLike$$anon$1;
/** @constructor */
ScalaJS.h.scm_LinkedListLike$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_LinkedListLike$$anon$1.prototype = ScalaJS.c.scm_LinkedListLike$$anon$1.prototype;
ScalaJS.c.scm_LinkedListLike$$anon$1.prototype.next__O = (function() {
  var res = this.elems$2.elem$5;
  this.elems$2 = ScalaJS.as.scm_LinkedListLike(this.elems$2.next$5);
  return res
});
ScalaJS.c.scm_LinkedListLike$$anon$1.prototype.hasNext__Z = (function() {
  var this$1 = this.elems$2;
  return ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)
});
ScalaJS.c.scm_LinkedListLike$$anon$1.prototype.init___scm_LinkedListLike = (function($$outer) {
  this.elems$2 = $$outer;
  return this
});
ScalaJS.d.scm_LinkedListLike$$anon$1 = new ScalaJS.ClassTypeData({
  scm_LinkedListLike$$anon$1: 0
}, false, "scala.collection.mutable.LinkedListLike$$anon$1", {
  scm_LinkedListLike$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.scm_LinkedListLike$$anon$1.prototype.$classData = ScalaJS.d.scm_LinkedListLike$$anon$1;
/** @constructor */
ScalaJS.c.scm_ListBuffer$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.cursor$2 = null
});
ScalaJS.c.scm_ListBuffer$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.constructor = ScalaJS.c.scm_ListBuffer$$anon$1;
/** @constructor */
ScalaJS.h.scm_ListBuffer$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ListBuffer$$anon$1.prototype = ScalaJS.c.scm_ListBuffer$$anon$1.prototype;
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.init___scm_ListBuffer = (function($$outer) {
  this.cursor$2 = ($$outer.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z() ? ScalaJS.m.sci_Nil$() : $$outer.scala$collection$mutable$ListBuffer$$start$6);
  return this
});
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.next__O = (function() {
  if ((!this.hasNext__Z())) {
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("next on empty Iterator")
  } else {
    var ans = this.cursor$2.head__O();
    var this$1 = this.cursor$2;
    this.cursor$2 = this$1.tail__sci_List();
    return ans
  }
});
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.hasNext__Z = (function() {
  return (this.cursor$2 !== ScalaJS.m.sci_Nil$())
});
ScalaJS.d.scm_ListBuffer$$anon$1 = new ScalaJS.ClassTypeData({
  scm_ListBuffer$$anon$1: 0
}, false, "scala.collection.mutable.ListBuffer$$anon$1", {
  scm_ListBuffer$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.scm_ListBuffer$$anon$1.prototype.$classData = ScalaJS.d.scm_ListBuffer$$anon$1;
/** @constructor */
ScalaJS.c.sr_ScalaRunTime$$anon$1 = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.c$2 = 0;
  this.cmax$2 = 0;
  this.x$2$2 = null
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.constructor = ScalaJS.c.sr_ScalaRunTime$$anon$1;
/** @constructor */
ScalaJS.h.sr_ScalaRunTime$$anon$1 = (function() {
  /*<skip>*/
});
ScalaJS.h.sr_ScalaRunTime$$anon$1.prototype = ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype;
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.next__O = (function() {
  var result = this.x$2$2.productElement__I__O(this.c$2);
  this.c$2 = ((1 + this.c$2) | 0);
  return result
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.init___s_Product = (function(x$2) {
  this.x$2$2 = x$2;
  this.c$2 = 0;
  this.cmax$2 = x$2.productArity__I();
  return this
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.hasNext__Z = (function() {
  return (this.c$2 < this.cmax$2)
});
ScalaJS.d.sr_ScalaRunTime$$anon$1 = new ScalaJS.ClassTypeData({
  sr_ScalaRunTime$$anon$1: 0
}, false, "scala.runtime.ScalaRunTime$$anon$1", {
  sr_ScalaRunTime$$anon$1: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1
});
ScalaJS.c.sr_ScalaRunTime$$anon$1.prototype.$classData = ScalaJS.d.sr_ScalaRunTime$$anon$1;
/** @constructor */
ScalaJS.c.Ljava_io_PrintStream = (function() {
  ScalaJS.c.Ljava_io_FilterOutputStream.call(this);
  this.autoFlush$3 = false;
  this.charset$3 = null;
  this.encoder$3 = null;
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  this.bitmap$0$3 = false
});
ScalaJS.c.Ljava_io_PrintStream.prototype = new ScalaJS.h.Ljava_io_FilterOutputStream();
ScalaJS.c.Ljava_io_PrintStream.prototype.constructor = ScalaJS.c.Ljava_io_PrintStream;
/** @constructor */
ScalaJS.h.Ljava_io_PrintStream = (function() {
  /*<skip>*/
});
ScalaJS.h.Ljava_io_PrintStream.prototype = ScalaJS.c.Ljava_io_PrintStream.prototype;
ScalaJS.c.Ljava_io_PrintStream.prototype.println__O__V = (function(obj) {
  this.print__O__V(obj);
  this.printString__p4__T__V("\n")
});
ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset = (function(_out, autoFlush, charset) {
  this.autoFlush$3 = autoFlush;
  this.charset$3 = charset;
  ScalaJS.c.Ljava_io_FilterOutputStream.prototype.init___Ljava_io_OutputStream.call(this, _out);
  this.closing$3 = false;
  this.java$io$PrintStream$$closed$3 = false;
  this.errorFlag$3 = false;
  return this
});
ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream = (function(out) {
  ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream__Z__Ljava_nio_charset_Charset.call(this, out, false, null);
  return this
});
ScalaJS.is.Ljava_io_PrintStream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.Ljava_io_PrintStream)))
});
ScalaJS.as.Ljava_io_PrintStream = (function(obj) {
  return ((ScalaJS.is.Ljava_io_PrintStream(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "java.io.PrintStream"))
});
ScalaJS.isArrayOf.Ljava_io_PrintStream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.Ljava_io_PrintStream)))
});
ScalaJS.asArrayOf.Ljava_io_PrintStream = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.Ljava_io_PrintStream(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Ljava.io.PrintStream;", depth))
});
/** @constructor */
ScalaJS.c.T2 = (function() {
  ScalaJS.c.O.call(this);
  this.$$und1$f = null;
  this.$$und2$f = null
});
ScalaJS.c.T2.prototype = new ScalaJS.h.O();
ScalaJS.c.T2.prototype.constructor = ScalaJS.c.T2;
/** @constructor */
ScalaJS.h.T2 = (function() {
  /*<skip>*/
});
ScalaJS.h.T2.prototype = ScalaJS.c.T2.prototype;
ScalaJS.c.T2.prototype.productPrefix__T = (function() {
  return "Tuple2"
});
ScalaJS.c.T2.prototype.productArity__I = (function() {
  return 2
});
ScalaJS.c.T2.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.T2(x$1)) {
    var Tuple2$1 = ScalaJS.as.T2(x$1);
    return (ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und1$f, Tuple2$1.$$und1$f) && ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.$$und2$f, Tuple2$1.$$und2$f))
  } else {
    return false
  }
});
ScalaJS.c.T2.prototype.init___O__O = (function(_1, _2) {
  this.$$und1$f = _1;
  this.$$und2$f = _2;
  return this
});
ScalaJS.c.T2.prototype.productElement__I__O = (function(n) {
  return ScalaJS.s.s_Product2$class__productElement__s_Product2__I__O(this, n)
});
ScalaJS.c.T2.prototype.toString__T = (function() {
  return (((("(" + this.$$und1$f) + ",") + this.$$und2$f) + ")")
});
ScalaJS.c.T2.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.T2.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.T2 = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.T2)))
});
ScalaJS.as.T2 = (function(obj) {
  return ((ScalaJS.is.T2(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.Tuple2"))
});
ScalaJS.isArrayOf.T2 = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.T2)))
});
ScalaJS.asArrayOf.T2 = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.T2(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.Tuple2;", depth))
});
ScalaJS.d.T2 = new ScalaJS.ClassTypeData({
  T2: 0
}, false, "scala.Tuple2", {
  T2: 1,
  O: 1,
  s_Product2: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.T2.prototype.$classData = ScalaJS.d.T2;
/** @constructor */
ScalaJS.c.s_util_Left = (function() {
  ScalaJS.c.s_util_Either.call(this);
  this.a$2 = null
});
ScalaJS.c.s_util_Left.prototype = new ScalaJS.h.s_util_Either();
ScalaJS.c.s_util_Left.prototype.constructor = ScalaJS.c.s_util_Left;
/** @constructor */
ScalaJS.h.s_util_Left = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Left.prototype = ScalaJS.c.s_util_Left.prototype;
ScalaJS.c.s_util_Left.prototype.productPrefix__T = (function() {
  return "Left"
});
ScalaJS.c.s_util_Left.prototype.productArity__I = (function() {
  return 1
});
ScalaJS.c.s_util_Left.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.s_util_Left(x$1)) {
    var Left$1 = ScalaJS.as.s_util_Left(x$1);
    return ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.a$2, Left$1.a$2)
  } else {
    return false
  }
});
ScalaJS.c.s_util_Left.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.a$2;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.s_util_Left.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.s_util_Left.prototype.init___O = (function(a) {
  this.a$2 = a;
  return this
});
ScalaJS.c.s_util_Left.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.s_util_Left.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.s_util_Left = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Left)))
});
ScalaJS.as.s_util_Left = (function(obj) {
  return ((ScalaJS.is.s_util_Left(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.util.Left"))
});
ScalaJS.isArrayOf.s_util_Left = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Left)))
});
ScalaJS.asArrayOf.s_util_Left = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_util_Left(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.util.Left;", depth))
});
ScalaJS.d.s_util_Left = new ScalaJS.ClassTypeData({
  s_util_Left: 0
}, false, "scala.util.Left", {
  s_util_Left: 1,
  s_util_Either: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_util_Left.prototype.$classData = ScalaJS.d.s_util_Left;
/** @constructor */
ScalaJS.c.s_util_Right = (function() {
  ScalaJS.c.s_util_Either.call(this);
  this.b$2 = null
});
ScalaJS.c.s_util_Right.prototype = new ScalaJS.h.s_util_Either();
ScalaJS.c.s_util_Right.prototype.constructor = ScalaJS.c.s_util_Right;
/** @constructor */
ScalaJS.h.s_util_Right = (function() {
  /*<skip>*/
});
ScalaJS.h.s_util_Right.prototype = ScalaJS.c.s_util_Right.prototype;
ScalaJS.c.s_util_Right.prototype.productPrefix__T = (function() {
  return "Right"
});
ScalaJS.c.s_util_Right.prototype.productArity__I = (function() {
  return 1
});
ScalaJS.c.s_util_Right.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.s_util_Right(x$1)) {
    var Right$1 = ScalaJS.as.s_util_Right(x$1);
    return ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.b$2, Right$1.b$2)
  } else {
    return false
  }
});
ScalaJS.c.s_util_Right.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.b$2;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.s_util_Right.prototype.toString__T = (function() {
  return ScalaJS.m.sr_ScalaRunTime$().$$undtoString__s_Product__T(this)
});
ScalaJS.c.s_util_Right.prototype.init___O = (function(b) {
  this.b$2 = b;
  return this
});
ScalaJS.c.s_util_Right.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.s_util_Right.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.s_util_Right = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.s_util_Right)))
});
ScalaJS.as.s_util_Right = (function(obj) {
  return ((ScalaJS.is.s_util_Right(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.util.Right"))
});
ScalaJS.isArrayOf.s_util_Right = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.s_util_Right)))
});
ScalaJS.asArrayOf.s_util_Right = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.s_util_Right(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.util.Right;", depth))
});
ScalaJS.d.s_util_Right = new ScalaJS.ClassTypeData({
  s_util_Right: 0
}, false, "scala.util.Right", {
  s_util_Right: 1,
  s_util_Either: 1,
  O: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.s_util_Right.prototype.$classData = ScalaJS.d.s_util_Right;
/** @constructor */
ScalaJS.c.scg_SeqFactory = (function() {
  ScalaJS.c.scg_GenSeqFactory.call(this)
});
ScalaJS.c.scg_SeqFactory.prototype = new ScalaJS.h.scg_GenSeqFactory();
ScalaJS.c.scg_SeqFactory.prototype.constructor = ScalaJS.c.scg_SeqFactory;
/** @constructor */
ScalaJS.h.scg_SeqFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_SeqFactory.prototype = ScalaJS.c.scg_SeqFactory.prototype;
/** @constructor */
ScalaJS.c.sci_VectorIterator = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.endIndex$2 = 0;
  this.blockIndex$2 = 0;
  this.lo$2 = 0;
  this.endLo$2 = 0;
  this.$$undhasNext$2 = false;
  this.depth$2 = 0;
  this.display0$2 = null;
  this.display1$2 = null;
  this.display2$2 = null;
  this.display3$2 = null;
  this.display4$2 = null;
  this.display5$2 = null
});
ScalaJS.c.sci_VectorIterator.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sci_VectorIterator.prototype.constructor = ScalaJS.c.sci_VectorIterator;
/** @constructor */
ScalaJS.h.sci_VectorIterator = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_VectorIterator.prototype = ScalaJS.c.sci_VectorIterator.prototype;
ScalaJS.c.sci_VectorIterator.prototype.next__O = (function() {
  if ((!this.$$undhasNext$2)) {
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("reached iterator end")
  };
  var res = this.display0$2.u[this.lo$2];
  this.lo$2 = ((1 + this.lo$2) | 0);
  if ((this.lo$2 === this.endLo$2)) {
    if ((((this.blockIndex$2 + this.lo$2) | 0) < this.endIndex$2)) {
      var newBlockIndex = ((32 + this.blockIndex$2) | 0);
      var xor = (this.blockIndex$2 ^ newBlockIndex);
      ScalaJS.s.sci_VectorPointer$class__gotoNextBlockStart__sci_VectorPointer__I__I__V(this, newBlockIndex, xor);
      this.blockIndex$2 = newBlockIndex;
      var x = ((this.endIndex$2 - this.blockIndex$2) | 0);
      this.endLo$2 = ((x < 32) ? x : 32);
      this.lo$2 = 0
    } else {
      this.$$undhasNext$2 = false
    }
  };
  return res
});
ScalaJS.c.sci_VectorIterator.prototype.display3__AO = (function() {
  return this.display3$2
});
ScalaJS.c.sci_VectorIterator.prototype.depth__I = (function() {
  return this.depth$2
});
ScalaJS.c.sci_VectorIterator.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.init___I__I = (function(_startIndex, endIndex) {
  this.endIndex$2 = endIndex;
  this.blockIndex$2 = ((-32) & _startIndex);
  this.lo$2 = (31 & _startIndex);
  var x = ((endIndex - this.blockIndex$2) | 0);
  this.endLo$2 = ((x < 32) ? x : 32);
  this.$$undhasNext$2 = (((this.blockIndex$2 + this.lo$2) | 0) < endIndex);
  return this
});
ScalaJS.c.sci_VectorIterator.prototype.display0__AO = (function() {
  return this.display0$2
});
ScalaJS.c.sci_VectorIterator.prototype.display4__AO = (function() {
  return this.display4$2
});
ScalaJS.c.sci_VectorIterator.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.hasNext__Z = (function() {
  return this.$$undhasNext$2
});
ScalaJS.c.sci_VectorIterator.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.display1__AO = (function() {
  return this.display1$2
});
ScalaJS.c.sci_VectorIterator.prototype.display5__AO = (function() {
  return this.display5$2
});
ScalaJS.c.sci_VectorIterator.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.display2__AO = (function() {
  return this.display2$2
});
ScalaJS.c.sci_VectorIterator.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$2 = x$1
});
ScalaJS.c.sci_VectorIterator.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$2 = x$1
});
ScalaJS.d.sci_VectorIterator = new ScalaJS.ClassTypeData({
  sci_VectorIterator: 0
}, false, "scala.collection.immutable.VectorIterator", {
  sci_VectorIterator: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sci_VectorPointer: 1
});
ScalaJS.c.sci_VectorIterator.prototype.$classData = ScalaJS.d.sci_VectorIterator;
/** @constructor */
ScalaJS.c.sjsr_UndefinedBehaviorError = (function() {
  ScalaJS.c.jl_Error.call(this)
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype = new ScalaJS.h.jl_Error();
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.constructor = ScalaJS.c.sjsr_UndefinedBehaviorError;
/** @constructor */
ScalaJS.h.sjsr_UndefinedBehaviorError = (function() {
  /*<skip>*/
});
ScalaJS.h.sjsr_UndefinedBehaviorError.prototype = ScalaJS.c.sjsr_UndefinedBehaviorError.prototype;
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.fillInStackTrace__jl_Throwable = (function() {
  return ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.scala$util$control$NoStackTrace$$super$fillInStackTrace__jl_Throwable = (function() {
  return ScalaJS.c.jl_Throwable.prototype.fillInStackTrace__jl_Throwable.call(this)
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.init___jl_Throwable = (function(cause) {
  ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable.call(this, ("An undefined behavior was detected" + ((cause === null) ? "" : (": " + cause.getMessage__T()))), cause);
  return this
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.init___T__jl_Throwable = (function(message, cause) {
  ScalaJS.c.jl_Error.prototype.init___T__jl_Throwable.call(this, message, cause);
  return this
});
ScalaJS.d.sjsr_UndefinedBehaviorError = new ScalaJS.ClassTypeData({
  sjsr_UndefinedBehaviorError: 0
}, false, "scala.scalajs.runtime.UndefinedBehaviorError", {
  sjsr_UndefinedBehaviorError: 1,
  jl_Error: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_util_control_ControlThrowable: 1,
  s_util_control_NoStackTrace: 1
});
ScalaJS.c.sjsr_UndefinedBehaviorError.prototype.$classData = ScalaJS.d.sjsr_UndefinedBehaviorError;
/** @constructor */
ScalaJS.c.jl_JSConsoleBasedPrintStream = (function() {
  ScalaJS.c.Ljava_io_PrintStream.call(this);
  this.isErr$4 = null;
  this.flushed$4 = false;
  this.buffer$4 = null
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype = new ScalaJS.h.Ljava_io_PrintStream();
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.constructor = ScalaJS.c.jl_JSConsoleBasedPrintStream;
/** @constructor */
ScalaJS.h.jl_JSConsoleBasedPrintStream = (function() {
  /*<skip>*/
});
ScalaJS.h.jl_JSConsoleBasedPrintStream.prototype = ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype;
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.init___jl_Boolean = (function(isErr) {
  this.isErr$4 = isErr;
  ScalaJS.c.Ljava_io_PrintStream.prototype.init___Ljava_io_OutputStream.call(this, new ScalaJS.c.jl_JSConsoleBasedPrintStream$DummyOutputStream().init___());
  this.flushed$4 = true;
  this.buffer$4 = "";
  return this
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.doWriteLine__p4__T__V = (function(line) {
  var x = ScalaJS.g["console"];
  if (ScalaJS.uZ((!(!x)))) {
    var x$1 = this.isErr$4;
    if (ScalaJS.uZ(x$1)) {
      var x$2 = ScalaJS.g["console"]["error"];
      var jsx$1 = ScalaJS.uZ((!(!x$2)))
    } else {
      var jsx$1 = false
    };
    if (jsx$1) {
      ScalaJS.g["console"]["error"](line)
    } else {
      ScalaJS.g["console"]["log"](line)
    }
  }
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.print__O__V = (function(obj) {
  this.printString__p4__T__V(ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T(obj))
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.printString__p4__T__V = (function(s) {
  var rest = s;
  while ((rest !== "")) {
    var thiz = rest;
    var nlPos = ScalaJS.uI(thiz["indexOf"]("\n"));
    if ((nlPos < 0)) {
      this.buffer$4 = (("" + this.buffer$4) + rest);
      this.flushed$4 = false;
      rest = ""
    } else {
      var jsx$1 = this.buffer$4;
      var thiz$1 = rest;
      this.doWriteLine__p4__T__V((("" + jsx$1) + ScalaJS.as.T(thiz$1["substring"](0, nlPos))));
      this.buffer$4 = "";
      this.flushed$4 = true;
      var thiz$2 = rest;
      var beginIndex = ((1 + nlPos) | 0);
      rest = ScalaJS.as.T(thiz$2["substring"](beginIndex))
    }
  }
});
ScalaJS.d.jl_JSConsoleBasedPrintStream = new ScalaJS.ClassTypeData({
  jl_JSConsoleBasedPrintStream: 0
}, false, "java.lang.JSConsoleBasedPrintStream", {
  jl_JSConsoleBasedPrintStream: 1,
  Ljava_io_PrintStream: 1,
  Ljava_io_FilterOutputStream: 1,
  Ljava_io_OutputStream: 1,
  O: 1,
  Ljava_io_Closeable: 1,
  Ljava_io_Flushable: 1,
  jl_Appendable: 1
});
ScalaJS.c.jl_JSConsoleBasedPrintStream.prototype.$classData = ScalaJS.d.jl_JSConsoleBasedPrintStream;
/** @constructor */
ScalaJS.c.sc_Seq$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.sc_Seq$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sc_Seq$.prototype.constructor = ScalaJS.c.sc_Seq$;
/** @constructor */
ScalaJS.h.sc_Seq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_Seq$.prototype = ScalaJS.c.sc_Seq$.prototype;
ScalaJS.c.sc_Seq$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_Seq$();
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sc_Seq$ = new ScalaJS.ClassTypeData({
  sc_Seq$: 0
}, false, "scala.collection.Seq$", {
  sc_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sc_Seq$.prototype.$classData = ScalaJS.d.sc_Seq$;
ScalaJS.n.sc_Seq$ = (void 0);
ScalaJS.m.sc_Seq$ = (function() {
  if ((!ScalaJS.n.sc_Seq$)) {
    ScalaJS.n.sc_Seq$ = new ScalaJS.c.sc_Seq$().init___()
  };
  return ScalaJS.n.sc_Seq$
});
/** @constructor */
ScalaJS.c.scg_IndexedSeqFactory = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scg_IndexedSeqFactory.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scg_IndexedSeqFactory.prototype.constructor = ScalaJS.c.scg_IndexedSeqFactory;
/** @constructor */
ScalaJS.h.scg_IndexedSeqFactory = (function() {
  /*<skip>*/
});
ScalaJS.h.scg_IndexedSeqFactory.prototype = ScalaJS.c.scg_IndexedSeqFactory.prototype;
/** @constructor */
ScalaJS.c.sci_Seq$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.sci_Seq$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sci_Seq$.prototype.constructor = ScalaJS.c.sci_Seq$;
/** @constructor */
ScalaJS.h.sci_Seq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Seq$.prototype = ScalaJS.c.sci_Seq$.prototype;
ScalaJS.c.sci_Seq$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sci_Seq$ = new ScalaJS.ClassTypeData({
  sci_Seq$: 0
}, false, "scala.collection.immutable.Seq$", {
  sci_Seq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sci_Seq$.prototype.$classData = ScalaJS.d.sci_Seq$;
ScalaJS.n.sci_Seq$ = (void 0);
ScalaJS.m.sci_Seq$ = (function() {
  if ((!ScalaJS.n.sci_Seq$)) {
    ScalaJS.n.sci_Seq$ = new ScalaJS.c.sci_Seq$().init___()
  };
  return ScalaJS.n.sci_Seq$
});
/** @constructor */
ScalaJS.c.scm_IndexedSeq$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_IndexedSeq$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_IndexedSeq$.prototype.constructor = ScalaJS.c.scm_IndexedSeq$;
/** @constructor */
ScalaJS.h.scm_IndexedSeq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_IndexedSeq$.prototype = ScalaJS.c.scm_IndexedSeq$.prototype;
ScalaJS.c.scm_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ArrayBuffer().init___()
});
ScalaJS.d.scm_IndexedSeq$ = new ScalaJS.ClassTypeData({
  scm_IndexedSeq$: 0
}, false, "scala.collection.mutable.IndexedSeq$", {
  scm_IndexedSeq$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.scm_IndexedSeq$.prototype.$classData = ScalaJS.d.scm_IndexedSeq$;
ScalaJS.n.scm_IndexedSeq$ = (void 0);
ScalaJS.m.scm_IndexedSeq$ = (function() {
  if ((!ScalaJS.n.scm_IndexedSeq$)) {
    ScalaJS.n.scm_IndexedSeq$ = new ScalaJS.c.scm_IndexedSeq$().init___()
  };
  return ScalaJS.n.scm_IndexedSeq$
});
/** @constructor */
ScalaJS.c.sjs_js_WrappedArray$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.sjs_js_WrappedArray$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sjs_js_WrappedArray$.prototype.constructor = ScalaJS.c.sjs_js_WrappedArray$;
/** @constructor */
ScalaJS.h.sjs_js_WrappedArray$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_WrappedArray$.prototype = ScalaJS.c.sjs_js_WrappedArray$.prototype;
ScalaJS.c.sjs_js_WrappedArray$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.sjs_js_WrappedArray().init___()
});
ScalaJS.d.sjs_js_WrappedArray$ = new ScalaJS.ClassTypeData({
  sjs_js_WrappedArray$: 0
}, false, "scala.scalajs.js.WrappedArray$", {
  sjs_js_WrappedArray$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sjs_js_WrappedArray$.prototype.$classData = ScalaJS.d.sjs_js_WrappedArray$;
ScalaJS.n.sjs_js_WrappedArray$ = (void 0);
ScalaJS.m.sjs_js_WrappedArray$ = (function() {
  if ((!ScalaJS.n.sjs_js_WrappedArray$)) {
    ScalaJS.n.sjs_js_WrappedArray$ = new ScalaJS.c.sjs_js_WrappedArray$().init___()
  };
  return ScalaJS.n.sjs_js_WrappedArray$
});
/** @constructor */
ScalaJS.c.sc_IndexedSeq$ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.call(this);
  this.ReusableCBF$6 = null
});
ScalaJS.c.sc_IndexedSeq$.prototype = new ScalaJS.h.scg_IndexedSeqFactory();
ScalaJS.c.sc_IndexedSeq$.prototype.constructor = ScalaJS.c.sc_IndexedSeq$;
/** @constructor */
ScalaJS.h.sc_IndexedSeq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_IndexedSeq$.prototype = ScalaJS.c.sc_IndexedSeq$.prototype;
ScalaJS.c.sc_IndexedSeq$.prototype.init___ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.prototype.init___.call(this);
  ScalaJS.n.sc_IndexedSeq$ = this;
  this.ReusableCBF$6 = new ScalaJS.c.sc_IndexedSeq$$anon$1().init___();
  return this
});
ScalaJS.c.sc_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_IndexedSeq$();
  ScalaJS.m.sci_Vector$();
  return new ScalaJS.c.sci_VectorBuilder().init___()
});
ScalaJS.d.sc_IndexedSeq$ = new ScalaJS.ClassTypeData({
  sc_IndexedSeq$: 0
}, false, "scala.collection.IndexedSeq$", {
  sc_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sc_IndexedSeq$.prototype.$classData = ScalaJS.d.sc_IndexedSeq$;
ScalaJS.n.sc_IndexedSeq$ = (void 0);
ScalaJS.m.sc_IndexedSeq$ = (function() {
  if ((!ScalaJS.n.sc_IndexedSeq$)) {
    ScalaJS.n.sc_IndexedSeq$ = new ScalaJS.c.sc_IndexedSeq$().init___()
  };
  return ScalaJS.n.sc_IndexedSeq$
});
/** @constructor */
ScalaJS.c.sc_IndexedSeqLike$Elements = (function() {
  ScalaJS.c.sc_AbstractIterator.call(this);
  this.end$2 = 0;
  this.index$2 = 0;
  this.$$outer$f = null
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype = new ScalaJS.h.sc_AbstractIterator();
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.constructor = ScalaJS.c.sc_IndexedSeqLike$Elements;
/** @constructor */
ScalaJS.h.sc_IndexedSeqLike$Elements = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_IndexedSeqLike$Elements.prototype = ScalaJS.c.sc_IndexedSeqLike$Elements.prototype;
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.next__O = (function() {
  if ((this.index$2 >= this.end$2)) {
    ScalaJS.m.sc_Iterator$().empty$1.next__O()
  };
  var x = this.$$outer$f.apply__I__O(this.index$2);
  this.index$2 = ((1 + this.index$2) | 0);
  return x
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.init___sc_IndexedSeqLike__I__I = (function($$outer, start, end) {
  this.end$2 = end;
  if (($$outer === null)) {
    throw ScalaJS.m.sjsr_package$().unwrapJavaScriptException__jl_Throwable__O(null)
  } else {
    this.$$outer$f = $$outer
  };
  this.index$2 = start;
  return this
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.hasNext__Z = (function() {
  return (this.index$2 < this.end$2)
});
ScalaJS.d.sc_IndexedSeqLike$Elements = new ScalaJS.ClassTypeData({
  sc_IndexedSeqLike$Elements: 0
}, false, "scala.collection.IndexedSeqLike$Elements", {
  sc_IndexedSeqLike$Elements: 1,
  sc_AbstractIterator: 1,
  O: 1,
  sc_Iterator: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_BufferedIterator: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sc_IndexedSeqLike$Elements.prototype.$classData = ScalaJS.d.sc_IndexedSeqLike$Elements;
/** @constructor */
ScalaJS.c.sci_IndexedSeq$ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.call(this)
});
ScalaJS.c.sci_IndexedSeq$.prototype = new ScalaJS.h.scg_IndexedSeqFactory();
ScalaJS.c.sci_IndexedSeq$.prototype.constructor = ScalaJS.c.sci_IndexedSeq$;
/** @constructor */
ScalaJS.h.sci_IndexedSeq$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_IndexedSeq$.prototype = ScalaJS.c.sci_IndexedSeq$.prototype;
ScalaJS.c.sci_IndexedSeq$.prototype.newBuilder__scm_Builder = (function() {
  ScalaJS.m.sci_Vector$();
  return new ScalaJS.c.sci_VectorBuilder().init___()
});
ScalaJS.d.sci_IndexedSeq$ = new ScalaJS.ClassTypeData({
  sci_IndexedSeq$: 0
}, false, "scala.collection.immutable.IndexedSeq$", {
  sci_IndexedSeq$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1
});
ScalaJS.c.sci_IndexedSeq$.prototype.$classData = ScalaJS.d.sci_IndexedSeq$;
ScalaJS.n.sci_IndexedSeq$ = (void 0);
ScalaJS.m.sci_IndexedSeq$ = (function() {
  if ((!ScalaJS.n.sci_IndexedSeq$)) {
    ScalaJS.n.sci_IndexedSeq$ = new ScalaJS.c.sci_IndexedSeq$().init___()
  };
  return ScalaJS.n.sci_IndexedSeq$
});
/** @constructor */
ScalaJS.c.sjs_js_JavaScriptException = (function() {
  ScalaJS.c.jl_RuntimeException.call(this);
  this.exception$4 = null
});
ScalaJS.c.sjs_js_JavaScriptException.prototype = new ScalaJS.h.jl_RuntimeException();
ScalaJS.c.sjs_js_JavaScriptException.prototype.constructor = ScalaJS.c.sjs_js_JavaScriptException;
/** @constructor */
ScalaJS.h.sjs_js_JavaScriptException = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_JavaScriptException.prototype = ScalaJS.c.sjs_js_JavaScriptException.prototype;
ScalaJS.c.sjs_js_JavaScriptException.prototype.productPrefix__T = (function() {
  return "JavaScriptException"
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.productArity__I = (function() {
  return 1
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.fillInStackTrace__jl_Throwable = (function() {
  ScalaJS.m.sjsr_StackTrace$().captureState__jl_Throwable__O__V(this, this.exception$4);
  return this
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.equals__O__Z = (function(x$1) {
  if ((this === x$1)) {
    return true
  } else if (ScalaJS.is.sjs_js_JavaScriptException(x$1)) {
    var JavaScriptException$1 = ScalaJS.as.sjs_js_JavaScriptException(x$1);
    return ScalaJS.m.sr_BoxesRunTime$().equals__O__O__Z(this.exception$4, JavaScriptException$1.exception$4)
  } else {
    return false
  }
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.exception$4;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.toString__T = (function() {
  return ScalaJS.objectToString(this.exception$4)
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.init___O = (function(exception) {
  this.exception$4 = exception;
  ScalaJS.c.jl_RuntimeException.prototype.init___.call(this);
  return this
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.hashCode__I = (function() {
  var this$2 = ScalaJS.m.s_util_hashing_MurmurHash3$();
  return this$2.productHash__s_Product__I__I(this, (-889275714))
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.is.sjs_js_JavaScriptException = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sjs_js_JavaScriptException)))
});
ScalaJS.as.sjs_js_JavaScriptException = (function(obj) {
  return ((ScalaJS.is.sjs_js_JavaScriptException(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.scalajs.js.JavaScriptException"))
});
ScalaJS.isArrayOf.sjs_js_JavaScriptException = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sjs_js_JavaScriptException)))
});
ScalaJS.asArrayOf.sjs_js_JavaScriptException = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sjs_js_JavaScriptException(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.scalajs.js.JavaScriptException;", depth))
});
ScalaJS.d.sjs_js_JavaScriptException = new ScalaJS.ClassTypeData({
  sjs_js_JavaScriptException: 0
}, false, "scala.scalajs.js.JavaScriptException", {
  sjs_js_JavaScriptException: 1,
  jl_RuntimeException: 1,
  jl_Exception: 1,
  jl_Throwable: 1,
  O: 1,
  Ljava_io_Serializable: 1,
  s_Product: 1,
  s_Equals: 1,
  s_Serializable: 1
});
ScalaJS.c.sjs_js_JavaScriptException.prototype.$classData = ScalaJS.d.sjs_js_JavaScriptException;
/** @constructor */
ScalaJS.c.sci_List$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this);
  this.partialNotApplied$5 = null
});
ScalaJS.c.sci_List$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sci_List$.prototype.constructor = ScalaJS.c.sci_List$;
/** @constructor */
ScalaJS.h.sci_List$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_List$.prototype = ScalaJS.c.sci_List$.prototype;
ScalaJS.c.sci_List$.prototype.init___ = (function() {
  ScalaJS.c.scg_SeqFactory.prototype.init___.call(this);
  ScalaJS.n.sci_List$ = this;
  this.partialNotApplied$5 = new ScalaJS.c.sci_List$$anon$1().init___();
  return this
});
ScalaJS.c.sci_List$.prototype.empty__sc_GenTraversable = (function() {
  return ScalaJS.m.sci_Nil$()
});
ScalaJS.c.sci_List$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ListBuffer().init___()
});
ScalaJS.d.sci_List$ = new ScalaJS.ClassTypeData({
  sci_List$: 0
}, false, "scala.collection.immutable.List$", {
  sci_List$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_List$.prototype.$classData = ScalaJS.d.sci_List$;
ScalaJS.n.sci_List$ = (void 0);
ScalaJS.m.sci_List$ = (function() {
  if ((!ScalaJS.n.sci_List$)) {
    ScalaJS.n.sci_List$ = new ScalaJS.c.sci_List$().init___()
  };
  return ScalaJS.n.sci_List$
});
/** @constructor */
ScalaJS.c.sci_Stream$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.sci_Stream$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.sci_Stream$.prototype.constructor = ScalaJS.c.sci_Stream$;
/** @constructor */
ScalaJS.h.sci_Stream$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$.prototype = ScalaJS.c.sci_Stream$.prototype;
ScalaJS.c.sci_Stream$.prototype.empty__sc_GenTraversable = (function() {
  return ScalaJS.m.sci_Stream$Empty$()
});
ScalaJS.c.sci_Stream$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.sci_Stream$StreamBuilder().init___()
});
ScalaJS.d.sci_Stream$ = new ScalaJS.ClassTypeData({
  sci_Stream$: 0
}, false, "scala.collection.immutable.Stream$", {
  sci_Stream$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Stream$.prototype.$classData = ScalaJS.d.sci_Stream$;
ScalaJS.n.sci_Stream$ = (void 0);
ScalaJS.m.sci_Stream$ = (function() {
  if ((!ScalaJS.n.sci_Stream$)) {
    ScalaJS.n.sci_Stream$ = new ScalaJS.c.sci_Stream$().init___()
  };
  return ScalaJS.n.sci_Stream$
});
/** @constructor */
ScalaJS.c.scm_ArrayBuffer$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_ArrayBuffer$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_ArrayBuffer$.prototype.constructor = ScalaJS.c.scm_ArrayBuffer$;
/** @constructor */
ScalaJS.h.scm_ArrayBuffer$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ArrayBuffer$.prototype = ScalaJS.c.scm_ArrayBuffer$.prototype;
ScalaJS.c.scm_ArrayBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_ArrayBuffer().init___()
});
ScalaJS.d.scm_ArrayBuffer$ = new ScalaJS.ClassTypeData({
  scm_ArrayBuffer$: 0
}, false, "scala.collection.mutable.ArrayBuffer$", {
  scm_ArrayBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ArrayBuffer$.prototype.$classData = ScalaJS.d.scm_ArrayBuffer$;
ScalaJS.n.scm_ArrayBuffer$ = (void 0);
ScalaJS.m.scm_ArrayBuffer$ = (function() {
  if ((!ScalaJS.n.scm_ArrayBuffer$)) {
    ScalaJS.n.scm_ArrayBuffer$ = new ScalaJS.c.scm_ArrayBuffer$().init___()
  };
  return ScalaJS.n.scm_ArrayBuffer$
});
/** @constructor */
ScalaJS.c.scm_LinkedList$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_LinkedList$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_LinkedList$.prototype.constructor = ScalaJS.c.scm_LinkedList$;
/** @constructor */
ScalaJS.h.scm_LinkedList$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_LinkedList$.prototype = ScalaJS.c.scm_LinkedList$.prototype;
ScalaJS.c.scm_LinkedList$.prototype.empty__sc_GenTraversable = (function() {
  return new ScalaJS.c.scm_LinkedList().init___()
});
ScalaJS.c.scm_LinkedList$.prototype.newBuilder__scm_Builder = (function() {
  var this$1 = new ScalaJS.c.scm_MutableList().init___();
  var f = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(l$2) {
      var l = ScalaJS.as.scm_MutableList(l$2);
      return l.first0$5
    })
  })(this));
  return new ScalaJS.c.scm_Builder$$anon$1().init___scm_Builder__F1(this$1, f)
});
ScalaJS.d.scm_LinkedList$ = new ScalaJS.ClassTypeData({
  scm_LinkedList$: 0
}, false, "scala.collection.mutable.LinkedList$", {
  scm_LinkedList$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_LinkedList$.prototype.$classData = ScalaJS.d.scm_LinkedList$;
ScalaJS.n.scm_LinkedList$ = (void 0);
ScalaJS.m.scm_LinkedList$ = (function() {
  if ((!ScalaJS.n.scm_LinkedList$)) {
    ScalaJS.n.scm_LinkedList$ = new ScalaJS.c.scm_LinkedList$().init___()
  };
  return ScalaJS.n.scm_LinkedList$
});
/** @constructor */
ScalaJS.c.scm_ListBuffer$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_ListBuffer$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_ListBuffer$.prototype.constructor = ScalaJS.c.scm_ListBuffer$;
/** @constructor */
ScalaJS.h.scm_ListBuffer$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ListBuffer$.prototype = ScalaJS.c.scm_ListBuffer$.prototype;
ScalaJS.c.scm_ListBuffer$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_GrowingBuilder().init___scg_Growable(new ScalaJS.c.scm_ListBuffer().init___())
});
ScalaJS.d.scm_ListBuffer$ = new ScalaJS.ClassTypeData({
  scm_ListBuffer$: 0
}, false, "scala.collection.mutable.ListBuffer$", {
  scm_ListBuffer$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ListBuffer$.prototype.$classData = ScalaJS.d.scm_ListBuffer$;
ScalaJS.n.scm_ListBuffer$ = (void 0);
ScalaJS.m.scm_ListBuffer$ = (function() {
  if ((!ScalaJS.n.scm_ListBuffer$)) {
    ScalaJS.n.scm_ListBuffer$ = new ScalaJS.c.scm_ListBuffer$().init___()
  };
  return ScalaJS.n.scm_ListBuffer$
});
/** @constructor */
ScalaJS.c.scm_MutableList$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_MutableList$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_MutableList$.prototype.constructor = ScalaJS.c.scm_MutableList$;
/** @constructor */
ScalaJS.h.scm_MutableList$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_MutableList$.prototype = ScalaJS.c.scm_MutableList$.prototype;
ScalaJS.c.scm_MutableList$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_MutableList().init___()
});
ScalaJS.d.scm_MutableList$ = new ScalaJS.ClassTypeData({
  scm_MutableList$: 0
}, false, "scala.collection.mutable.MutableList$", {
  scm_MutableList$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_MutableList$.prototype.$classData = ScalaJS.d.scm_MutableList$;
ScalaJS.n.scm_MutableList$ = (void 0);
ScalaJS.m.scm_MutableList$ = (function() {
  if ((!ScalaJS.n.scm_MutableList$)) {
    ScalaJS.n.scm_MutableList$ = new ScalaJS.c.scm_MutableList$().init___()
  };
  return ScalaJS.n.scm_MutableList$
});
/** @constructor */
ScalaJS.c.scm_Queue$ = (function() {
  ScalaJS.c.scg_SeqFactory.call(this)
});
ScalaJS.c.scm_Queue$.prototype = new ScalaJS.h.scg_SeqFactory();
ScalaJS.c.scm_Queue$.prototype.constructor = ScalaJS.c.scm_Queue$;
/** @constructor */
ScalaJS.h.scm_Queue$ = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_Queue$.prototype = ScalaJS.c.scm_Queue$.prototype;
ScalaJS.c.scm_Queue$.prototype.newBuilder__scm_Builder = (function() {
  var this$1 = new ScalaJS.c.scm_MutableList().init___();
  var f = new ScalaJS.c.sjsr_AnonFunction1().init___sjs_js_Function1((function(this$2) {
    return (function(x$1$2) {
      var x$1 = ScalaJS.as.scm_MutableList(x$1$2);
      return new ScalaJS.c.scm_Queue().init___scm_LinkedList__scm_LinkedList__I(x$1.first0$5, x$1.last0$5, x$1.len$5)
    })
  })(this));
  return new ScalaJS.c.scm_Builder$$anon$1().init___scm_Builder__F1(this$1, f)
});
ScalaJS.d.scm_Queue$ = new ScalaJS.ClassTypeData({
  scm_Queue$: 0
}, false, "scala.collection.mutable.Queue$", {
  scm_Queue$: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_Queue$.prototype.$classData = ScalaJS.d.scm_Queue$;
ScalaJS.n.scm_Queue$ = (void 0);
ScalaJS.m.scm_Queue$ = (function() {
  if ((!ScalaJS.n.scm_Queue$)) {
    ScalaJS.n.scm_Queue$ = new ScalaJS.c.scm_Queue$().init___()
  };
  return ScalaJS.n.scm_Queue$
});
ScalaJS.is.sc_GenSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_GenSeq)))
});
ScalaJS.as.sc_GenSeq = (function(obj) {
  return ((ScalaJS.is.sc_GenSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.GenSeq"))
});
ScalaJS.isArrayOf.sc_GenSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_GenSeq)))
});
ScalaJS.asArrayOf.sc_GenSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_GenSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.GenSeq;", depth))
});
/** @constructor */
ScalaJS.c.sci_Vector$ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.call(this);
  this.NIL$6 = null;
  this.Log2ConcatFaster$6 = 0;
  this.TinyAppendFaster$6 = 0
});
ScalaJS.c.sci_Vector$.prototype = new ScalaJS.h.scg_IndexedSeqFactory();
ScalaJS.c.sci_Vector$.prototype.constructor = ScalaJS.c.sci_Vector$;
/** @constructor */
ScalaJS.h.sci_Vector$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Vector$.prototype = ScalaJS.c.sci_Vector$.prototype;
ScalaJS.c.sci_Vector$.prototype.init___ = (function() {
  ScalaJS.c.scg_IndexedSeqFactory.prototype.init___.call(this);
  ScalaJS.n.sci_Vector$ = this;
  this.NIL$6 = new ScalaJS.c.sci_Vector().init___I__I__I(0, 0, 0);
  return this
});
ScalaJS.c.sci_Vector$.prototype.empty__sc_GenTraversable = (function() {
  return this.NIL$6
});
ScalaJS.c.sci_Vector$.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.sci_VectorBuilder().init___()
});
ScalaJS.d.sci_Vector$ = new ScalaJS.ClassTypeData({
  sci_Vector$: 0
}, false, "scala.collection.immutable.Vector$", {
  sci_Vector$: 1,
  scg_IndexedSeqFactory: 1,
  scg_SeqFactory: 1,
  scg_GenSeqFactory: 1,
  scg_GenTraversableFactory: 1,
  scg_GenericCompanion: 1,
  O: 1,
  scg_TraversableFactory: 1,
  scg_GenericSeqCompanion: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Vector$.prototype.$classData = ScalaJS.d.sci_Vector$;
ScalaJS.n.sci_Vector$ = (void 0);
ScalaJS.m.sci_Vector$ = (function() {
  if ((!ScalaJS.n.sci_Vector$)) {
    ScalaJS.n.sci_Vector$ = new ScalaJS.c.sci_Vector$().init___()
  };
  return ScalaJS.n.sci_Vector$
});
/** @constructor */
ScalaJS.c.sc_AbstractTraversable = (function() {
  ScalaJS.c.O.call(this)
});
ScalaJS.c.sc_AbstractTraversable.prototype = new ScalaJS.h.O();
ScalaJS.c.sc_AbstractTraversable.prototype.constructor = ScalaJS.c.sc_AbstractTraversable;
/** @constructor */
ScalaJS.h.sc_AbstractTraversable = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractTraversable.prototype = ScalaJS.c.sc_AbstractTraversable.prototype;
ScalaJS.c.sc_AbstractTraversable.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
ScalaJS.c.sc_AbstractTraversable.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this, b, start, sep, end)
});
ScalaJS.c.sc_AbstractTraversable.prototype.repr__O = (function() {
  return this
});
ScalaJS.c.sc_AbstractTraversable.prototype.nonEmpty__Z = (function() {
  return ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this)
});
ScalaJS.c.sc_AbstractTraversable.prototype.stringPrefix__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__stringPrefix__sc_TraversableLike__T(this)
});
ScalaJS.c.sc_AbstractTraversable.prototype.newBuilder__scm_Builder = (function() {
  return this.companion__scg_GenericCompanion().newBuilder__scm_Builder()
});
ScalaJS.is.sc_IndexedSeqLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeqLike)))
});
ScalaJS.as.sc_IndexedSeqLike = (function(obj) {
  return ((ScalaJS.is.sc_IndexedSeqLike(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.IndexedSeqLike"))
});
ScalaJS.isArrayOf.sc_IndexedSeqLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeqLike)))
});
ScalaJS.asArrayOf.sc_IndexedSeqLike = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_IndexedSeqLike(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.IndexedSeqLike;", depth))
});
ScalaJS.is.sc_LinearSeqLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqLike)))
});
ScalaJS.as.sc_LinearSeqLike = (function(obj) {
  return ((ScalaJS.is.sc_LinearSeqLike(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.LinearSeqLike"))
});
ScalaJS.isArrayOf.sc_LinearSeqLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqLike)))
});
ScalaJS.asArrayOf.sc_LinearSeqLike = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_LinearSeqLike(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.LinearSeqLike;", depth))
});
ScalaJS.is.sc_LinearSeqOptimized = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeqOptimized)))
});
ScalaJS.as.sc_LinearSeqOptimized = (function(obj) {
  return ((ScalaJS.is.sc_LinearSeqOptimized(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.LinearSeqOptimized"))
});
ScalaJS.isArrayOf.sc_LinearSeqOptimized = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeqOptimized)))
});
ScalaJS.asArrayOf.sc_LinearSeqOptimized = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_LinearSeqOptimized(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.LinearSeqOptimized;", depth))
});
ScalaJS.is.scm_LinkedListLike = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_LinkedListLike)))
});
ScalaJS.as.scm_LinkedListLike = (function(obj) {
  return ((ScalaJS.is.scm_LinkedListLike(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.LinkedListLike"))
});
ScalaJS.isArrayOf.scm_LinkedListLike = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_LinkedListLike)))
});
ScalaJS.asArrayOf.scm_LinkedListLike = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_LinkedListLike(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.LinkedListLike;", depth))
});
/** @constructor */
ScalaJS.c.sc_AbstractIterable = (function() {
  ScalaJS.c.sc_AbstractTraversable.call(this)
});
ScalaJS.c.sc_AbstractIterable.prototype = new ScalaJS.h.sc_AbstractTraversable();
ScalaJS.c.sc_AbstractIterable.prototype.constructor = ScalaJS.c.sc_AbstractIterable;
/** @constructor */
ScalaJS.h.sc_AbstractIterable = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractIterable.prototype = ScalaJS.c.sc_AbstractIterable.prototype;
ScalaJS.c.sc_AbstractIterable.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IterableLike$class__sameElements__sc_IterableLike__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sc_AbstractIterable.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.iterator__sc_Iterator();
  ScalaJS.s.sc_Iterator$class__foreach__sc_Iterator__F1__V(this$1, f)
});
ScalaJS.c.sc_AbstractIterable.prototype.toStream__sci_Stream = (function() {
  return this.iterator__sc_Iterator().toStream__sci_Stream()
});
ScalaJS.c.sc_AbstractIterable.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_IterableLike$class__copyToArray__sc_IterableLike__O__I__I__V(this, xs, start, len)
});
ScalaJS.is.sc_IndexedSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_IndexedSeq)))
});
ScalaJS.as.sc_IndexedSeq = (function(obj) {
  return ((ScalaJS.is.sc_IndexedSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.IndexedSeq"))
});
ScalaJS.isArrayOf.sc_IndexedSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_IndexedSeq)))
});
ScalaJS.asArrayOf.sc_IndexedSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_IndexedSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.IndexedSeq;", depth))
});
ScalaJS.is.sc_LinearSeq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sc_LinearSeq)))
});
ScalaJS.as.sc_LinearSeq = (function(obj) {
  return ((ScalaJS.is.sc_LinearSeq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.LinearSeq"))
});
ScalaJS.isArrayOf.sc_LinearSeq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sc_LinearSeq)))
});
ScalaJS.asArrayOf.sc_LinearSeq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sc_LinearSeq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.LinearSeq;", depth))
});
/** @constructor */
ScalaJS.c.sc_AbstractSeq = (function() {
  ScalaJS.c.sc_AbstractIterable.call(this)
});
ScalaJS.c.sc_AbstractSeq.prototype = new ScalaJS.h.sc_AbstractIterable();
ScalaJS.c.sc_AbstractSeq.prototype.constructor = ScalaJS.c.sc_AbstractSeq;
/** @constructor */
ScalaJS.h.sc_AbstractSeq = (function() {
  /*<skip>*/
});
ScalaJS.h.sc_AbstractSeq.prototype = ScalaJS.c.sc_AbstractSeq.prototype;
ScalaJS.c.sc_AbstractSeq.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_SeqLike$class__lengthCompare__sc_SeqLike__I__I(this, len)
});
ScalaJS.c.sc_AbstractSeq.prototype.equals__O__Z = (function(that) {
  return ScalaJS.s.sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
});
ScalaJS.c.sc_AbstractSeq.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_SeqLike$class__isEmpty__sc_SeqLike__Z(this)
});
ScalaJS.c.sc_AbstractSeq.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableLike$class__toString__sc_TraversableLike__T(this)
});
ScalaJS.c.sc_AbstractSeq.prototype.size__I = (function() {
  return this.length__I()
});
ScalaJS.c.sc_AbstractSeq.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this.seq__sc_Seq())
});
ScalaJS.is.scm_Seq = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Seq)))
});
ScalaJS.as.scm_Seq = (function(obj) {
  return ((ScalaJS.is.scm_Seq(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.Seq"))
});
ScalaJS.isArrayOf.scm_Seq = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Seq)))
});
ScalaJS.asArrayOf.scm_Seq = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_Seq(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.Seq;", depth))
});
/** @constructor */
ScalaJS.c.scm_AbstractSeq = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this)
});
ScalaJS.c.scm_AbstractSeq.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.scm_AbstractSeq.prototype.constructor = ScalaJS.c.scm_AbstractSeq;
/** @constructor */
ScalaJS.h.scm_AbstractSeq = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractSeq.prototype = ScalaJS.c.scm_AbstractSeq.prototype;
ScalaJS.c.scm_AbstractSeq.prototype.seq__sc_TraversableOnce = (function() {
  return this.seq__scm_Seq()
});
ScalaJS.c.scm_AbstractSeq.prototype.seq__scm_Seq = (function() {
  return this
});
/** @constructor */
ScalaJS.c.sci_List = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this)
});
ScalaJS.c.sci_List.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.sci_List.prototype.constructor = ScalaJS.c.sci_List;
/** @constructor */
ScalaJS.h.sci_List = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_List.prototype = ScalaJS.c.sci_List.prototype;
ScalaJS.c.sci_List.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_List.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_List.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this, len)
});
ScalaJS.c.sci_List.prototype.apply__O__O = (function(v1) {
  var n = ScalaJS.uI(v1);
  return ScalaJS.s.sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
ScalaJS.c.sci_List.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sci_List.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_List.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_List(n)
});
ScalaJS.c.sci_List.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_List$()
});
ScalaJS.c.sci_List.prototype.foreach__F1__V = (function(f) {
  var these = this;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$1 = these;
    these = this$1.tail__sci_List()
  }
});
ScalaJS.c.sci_List.prototype.drop__I__sci_List = (function(n) {
  var these = this;
  var count = n;
  while (((!these.isEmpty__Z()) && (count > 0))) {
    var this$1 = these;
    these = this$1.tail__sci_List();
    count = (((-1) + count) | 0)
  };
  return these
});
ScalaJS.c.sci_List.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_LinearSeqLike$$anon$1().init___sc_LinearSeqLike(this)
});
ScalaJS.c.sci_List.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.sci_List.prototype.length__I = (function() {
  return ScalaJS.s.sc_LinearSeqOptimized$class__length__sc_LinearSeqOptimized__I(this)
});
ScalaJS.c.sci_List.prototype.toStream__sci_Stream = (function() {
  return (this.isEmpty__Z() ? ScalaJS.m.sci_Stream$Empty$() : new ScalaJS.c.sci_Stream$Cons().init___O__F0(this.head__O(), new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2) {
    return (function() {
      return this$2.tail__sci_List().toStream__sci_Stream()
    })
  })(this))))
});
ScalaJS.c.sci_List.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sci_List.prototype.stringPrefix__T = (function() {
  return "List"
});
ScalaJS.is.sci_List = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_List)))
});
ScalaJS.as.sci_List = (function(obj) {
  return ((ScalaJS.is.sci_List(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.List"))
});
ScalaJS.isArrayOf.sci_List = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_List)))
});
ScalaJS.asArrayOf.sci_List = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_List(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.List;", depth))
});
/** @constructor */
ScalaJS.c.sci_Stream = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this)
});
ScalaJS.c.sci_Stream.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.sci_Stream.prototype.constructor = ScalaJS.c.sci_Stream;
/** @constructor */
ScalaJS.h.sci_Stream = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream.prototype = ScalaJS.c.sci_Stream.prototype;
ScalaJS.c.sci_Stream.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.init___ = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this, len)
});
ScalaJS.c.sci_Stream.prototype.apply__O__O = (function(v1) {
  var n = ScalaJS.uI(v1);
  return ScalaJS.s.sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this, n)
});
ScalaJS.c.sci_Stream.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sci_Stream.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.flatMap__F1__scg_CanBuildFrom__O = (function(f, bf) {
  if (ScalaJS.is.sci_Stream$StreamBuilder(bf.apply__O__scm_Builder(this))) {
    if (this.isEmpty__Z()) {
      var x$1 = ScalaJS.m.sci_Stream$Empty$()
    } else {
      var nonEmptyPrefix = new ScalaJS.c.sr_ObjectRef().init___O(this);
      var prefix = ScalaJS.as.sc_GenTraversableOnce(f.apply__O__O(ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream();
      while (((!ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z()) && prefix.isEmpty__Z())) {
        nonEmptyPrefix.elem$1 = ScalaJS.as.sci_Stream(ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).tail__O());
        if ((!ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z())) {
          prefix = ScalaJS.as.sc_GenTraversableOnce(f.apply__O__O(ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).head__O())).toStream__sci_Stream()
        }
      };
      var x$1 = (ScalaJS.as.sci_Stream(nonEmptyPrefix.elem$1).isEmpty__Z() ? (ScalaJS.m.sci_Stream$(), ScalaJS.m.sci_Stream$Empty$()) : prefix.append__F0__sci_Stream(new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2$1, f$1, nonEmptyPrefix$1) {
        return (function() {
          var x = ScalaJS.as.sci_Stream(ScalaJS.as.sci_Stream(nonEmptyPrefix$1.elem$1).tail__O()).flatMap__F1__scg_CanBuildFrom__O(f$1, (ScalaJS.m.sci_Stream$(), new ScalaJS.c.sci_Stream$StreamCanBuildFrom().init___()));
          return ScalaJS.as.sci_Stream(x)
        })
      })(this, f, nonEmptyPrefix))))
    };
    return x$1
  } else {
    return ScalaJS.s.sc_TraversableLike$class__flatMap__sc_TraversableLike__F1__scg_CanBuildFrom__O(this, f, bf)
  }
});
ScalaJS.c.sci_Stream.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return this.drop__I__sci_Stream(n)
});
ScalaJS.c.sci_Stream.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  this.force__sci_Stream();
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, start, sep, end)
});
ScalaJS.c.sci_Stream.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Stream$()
});
ScalaJS.c.sci_Stream.prototype.toString__T = (function() {
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this, ("Stream" + "("), ", ", ")")
});
ScalaJS.c.sci_Stream.prototype.foreach__F1__V = (function(f) {
  var _$this = this;
  x: {
    _foreach: while (true) {
      if ((!_$this.isEmpty__Z())) {
        f.apply__O__O(_$this.head__O());
        _$this = ScalaJS.as.sci_Stream(_$this.tail__O());
        continue _foreach
      };
      break x
    }
  }
});
ScalaJS.c.sci_Stream.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sci_StreamIterator().init___sci_Stream(this)
});
ScalaJS.c.sci_Stream.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.length__I = (function() {
  var len = 0;
  var left = this;
  while ((!left.isEmpty__Z())) {
    len = ((1 + len) | 0);
    left = ScalaJS.as.sci_Stream(left.tail__O())
  };
  return len
});
ScalaJS.c.sci_Stream.prototype.toStream__sci_Stream = (function() {
  return this
});
ScalaJS.c.sci_Stream.prototype.drop__I__sci_Stream = (function(n) {
  var _$this = this;
  _drop: while (true) {
    if (((n <= 0) || _$this.isEmpty__Z())) {
      return _$this
    } else {
      var temp$_$this = ScalaJS.as.sci_Stream(_$this.tail__O());
      var temp$n = (((-1) + n) | 0);
      _$this = temp$_$this;
      n = temp$n;
      continue _drop
    }
  }
});
ScalaJS.c.sci_Stream.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  b.append__T__scm_StringBuilder(start);
  if ((!this.isEmpty__Z())) {
    b.append__O__scm_StringBuilder(this.head__O());
    var cursor = this;
    var n = 1;
    if (cursor.tailDefined__Z()) {
      var scout = ScalaJS.as.sci_Stream(this.tail__O());
      if (scout.isEmpty__Z()) {
        b.append__T__scm_StringBuilder(end);
        return b
      };
      if (((cursor !== scout) && scout.tailDefined__Z())) {
        cursor = scout;
        scout = ScalaJS.as.sci_Stream(scout.tail__O());
        while (((cursor !== scout) && scout.tailDefined__Z())) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = ScalaJS.as.sci_Stream(cursor.tail__O());
          scout = ScalaJS.as.sci_Stream(scout.tail__O());
          if (scout.tailDefined__Z()) {
            scout = ScalaJS.as.sci_Stream(scout.tail__O())
          }
        }
      };
      if ((!scout.tailDefined__Z())) {
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = ScalaJS.as.sci_Stream(cursor.tail__O())
        }
      } else {
        var runner = this;
        var k = 0;
        while ((runner !== scout)) {
          runner = ScalaJS.as.sci_Stream(runner.tail__O());
          scout = ScalaJS.as.sci_Stream(scout.tail__O());
          k = ((1 + k) | 0)
        };
        if (((cursor === scout) && (k > 0))) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = ScalaJS.as.sci_Stream(cursor.tail__O())
        };
        while ((cursor !== scout)) {
          b.append__T__scm_StringBuilder(sep).append__O__scm_StringBuilder(cursor.head__O());
          n = ((1 + n) | 0);
          cursor = ScalaJS.as.sci_Stream(cursor.tail__O())
        };
        n = ((n - k) | 0)
      }
    };
    if ((!cursor.isEmpty__Z())) {
      if ((!cursor.tailDefined__Z())) {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("?")
      } else {
        b.append__T__scm_StringBuilder(sep).append__T__scm_StringBuilder("...")
      }
    }
  };
  b.append__T__scm_StringBuilder(end);
  return b
});
ScalaJS.c.sci_Stream.prototype.force__sci_Stream = (function() {
  var these = this;
  var those = this;
  if ((!these.isEmpty__Z())) {
    these = ScalaJS.as.sci_Stream(these.tail__O())
  };
  while ((those !== these)) {
    if (these.isEmpty__Z()) {
      return this
    };
    these = ScalaJS.as.sci_Stream(these.tail__O());
    if (these.isEmpty__Z()) {
      return this
    };
    these = ScalaJS.as.sci_Stream(these.tail__O());
    if ((these === those)) {
      return this
    };
    those = ScalaJS.as.sci_Stream(those.tail__O())
  };
  return this
});
ScalaJS.c.sci_Stream.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sci_Stream.prototype.append__F0__sci_Stream = (function(rest) {
  if (this.isEmpty__Z()) {
    return ScalaJS.as.sc_GenTraversableOnce(rest.apply__O()).toStream__sci_Stream()
  } else {
    var hd = this.head__O();
    var tl = new ScalaJS.c.sjsr_AnonFunction0().init___sjs_js_Function0((function(this$2, rest$1) {
      return (function() {
        return ScalaJS.as.sci_Stream(this$2.tail__O()).append__F0__sci_Stream(rest$1)
      })
    })(this, rest));
    return new ScalaJS.c.sci_Stream$Cons().init___O__F0(hd, tl)
  }
});
ScalaJS.c.sci_Stream.prototype.stringPrefix__T = (function() {
  return "Stream"
});
ScalaJS.is.sci_Stream = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.sci_Stream)))
});
ScalaJS.as.sci_Stream = (function(obj) {
  return ((ScalaJS.is.sci_Stream(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.immutable.Stream"))
});
ScalaJS.isArrayOf.sci_Stream = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.sci_Stream)))
});
ScalaJS.asArrayOf.sci_Stream = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.sci_Stream(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.immutable.Stream;", depth))
});
/** @constructor */
ScalaJS.c.sci_Stream$Cons = (function() {
  ScalaJS.c.sci_Stream.call(this);
  this.hd$5 = null;
  this.tlVal$5 = null;
  this.tlGen$5 = null
});
ScalaJS.c.sci_Stream$Cons.prototype = new ScalaJS.h.sci_Stream();
ScalaJS.c.sci_Stream$Cons.prototype.constructor = ScalaJS.c.sci_Stream$Cons;
/** @constructor */
ScalaJS.h.sci_Stream$Cons = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$Cons.prototype = ScalaJS.c.sci_Stream$Cons.prototype;
ScalaJS.c.sci_Stream$Cons.prototype.head__O = (function() {
  return this.hd$5
});
ScalaJS.c.sci_Stream$Cons.prototype.tail__sci_Stream = (function() {
  if ((!this.tailDefined__Z())) {
    if ((!this.tailDefined__Z())) {
      this.tlVal$5 = ScalaJS.as.sci_Stream(this.tlGen$5.apply__O());
      this.tlGen$5 = null
    }
  };
  return this.tlVal$5
});
ScalaJS.c.sci_Stream$Cons.prototype.tailDefined__Z = (function() {
  return (this.tlGen$5 === null)
});
ScalaJS.c.sci_Stream$Cons.prototype.isEmpty__Z = (function() {
  return false
});
ScalaJS.c.sci_Stream$Cons.prototype.tail__O = (function() {
  return this.tail__sci_Stream()
});
ScalaJS.c.sci_Stream$Cons.prototype.init___O__F0 = (function(hd, tl) {
  this.hd$5 = hd;
  this.tlGen$5 = tl;
  return this
});
ScalaJS.d.sci_Stream$Cons = new ScalaJS.ClassTypeData({
  sci_Stream$Cons: 0
}, false, "scala.collection.immutable.Stream$Cons", {
  sci_Stream$Cons: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Stream$Cons.prototype.$classData = ScalaJS.d.sci_Stream$Cons;
/** @constructor */
ScalaJS.c.sci_Stream$Empty$ = (function() {
  ScalaJS.c.sci_Stream.call(this)
});
ScalaJS.c.sci_Stream$Empty$.prototype = new ScalaJS.h.sci_Stream();
ScalaJS.c.sci_Stream$Empty$.prototype.constructor = ScalaJS.c.sci_Stream$Empty$;
/** @constructor */
ScalaJS.h.sci_Stream$Empty$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Stream$Empty$.prototype = ScalaJS.c.sci_Stream$Empty$.prototype;
ScalaJS.c.sci_Stream$Empty$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
ScalaJS.c.sci_Stream$Empty$.prototype.tailDefined__Z = (function() {
  return false
});
ScalaJS.c.sci_Stream$Empty$.prototype.isEmpty__Z = (function() {
  return true
});
ScalaJS.c.sci_Stream$Empty$.prototype.tail__sr_Nothing$ = (function() {
  throw new ScalaJS.c.jl_UnsupportedOperationException().init___T("tail of empty stream")
});
ScalaJS.c.sci_Stream$Empty$.prototype.head__sr_Nothing$ = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("head of empty stream")
});
ScalaJS.c.sci_Stream$Empty$.prototype.tail__O = (function() {
  this.tail__sr_Nothing$()
});
ScalaJS.d.sci_Stream$Empty$ = new ScalaJS.ClassTypeData({
  sci_Stream$Empty$: 0
}, false, "scala.collection.immutable.Stream$Empty$", {
  sci_Stream$Empty$: 1,
  sci_Stream: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.sci_Stream$Empty$.prototype.$classData = ScalaJS.d.sci_Stream$Empty$;
ScalaJS.n.sci_Stream$Empty$ = (void 0);
ScalaJS.m.sci_Stream$Empty$ = (function() {
  if ((!ScalaJS.n.sci_Stream$Empty$)) {
    ScalaJS.n.sci_Stream$Empty$ = new ScalaJS.c.sci_Stream$Empty$().init___()
  };
  return ScalaJS.n.sci_Stream$Empty$
});
/** @constructor */
ScalaJS.c.sci_Vector = (function() {
  ScalaJS.c.sc_AbstractSeq.call(this);
  this.startIndex$4 = 0;
  this.endIndex$4 = 0;
  this.focus$4 = 0;
  this.dirty$4 = false;
  this.depth$4 = 0;
  this.display0$4 = null;
  this.display1$4 = null;
  this.display2$4 = null;
  this.display3$4 = null;
  this.display4$4 = null;
  this.display5$4 = null
});
ScalaJS.c.sci_Vector.prototype = new ScalaJS.h.sc_AbstractSeq();
ScalaJS.c.sci_Vector.prototype.constructor = ScalaJS.c.sci_Vector;
/** @constructor */
ScalaJS.h.sci_Vector = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Vector.prototype = ScalaJS.c.sci_Vector.prototype;
ScalaJS.c.sci_Vector.prototype.checkRangeConvert__p4__I__I = (function(index) {
  var idx = ((index + this.startIndex$4) | 0);
  if (((index >= 0) && (idx < this.endIndex$4))) {
    return idx
  } else {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + index))
  }
});
ScalaJS.c.sci_Vector.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sci_Vector.prototype.display3__AO = (function() {
  return this.display3$4
});
ScalaJS.c.sci_Vector.prototype.apply__I__O = (function(index) {
  var idx = this.checkRangeConvert__p4__I__I(index);
  var xor = (idx ^ this.focus$4);
  return ScalaJS.s.sci_VectorPointer$class__getElem__sci_VectorPointer__I__I__O(this, idx, xor)
});
ScalaJS.c.sci_Vector.prototype.depth__I = (function() {
  return this.depth$4
});
ScalaJS.c.sci_Vector.prototype.lengthCompare__I__I = (function(len) {
  return ((this.length__I() - len) | 0)
});
ScalaJS.c.sci_Vector.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O(ScalaJS.uI(v1))
});
ScalaJS.c.sci_Vector.prototype.initIterator__sci_VectorIterator__V = (function(s) {
  var depth = this.depth$4;
  ScalaJS.s.sci_VectorPointer$class__initFrom__sci_VectorPointer__sci_VectorPointer__I__V(s, this, depth);
  if (this.dirty$4) {
    var index = this.focus$4;
    ScalaJS.s.sci_VectorPointer$class__stabilize__sci_VectorPointer__I__V(s, index)
  };
  if ((s.depth$2 > 1)) {
    var index$1 = this.startIndex$4;
    var xor = (this.startIndex$4 ^ this.focus$4);
    ScalaJS.s.sci_VectorPointer$class__gotoPos__sci_VectorPointer__I__I__V(s, index$1, xor)
  }
});
ScalaJS.c.sci_Vector.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sci_Vector.prototype.init___I__I__I = (function(startIndex, endIndex, focus) {
  this.startIndex$4 = startIndex;
  this.endIndex$4 = endIndex;
  this.focus$4 = focus;
  this.dirty$4 = false;
  return this
});
ScalaJS.c.sci_Vector.prototype.display5$und$eq__AO__V = (function(x$1) {
  this.display5$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sci_Vector$()
});
ScalaJS.c.sci_Vector.prototype.display0__AO = (function() {
  return this.display0$4
});
ScalaJS.c.sci_Vector.prototype.display4__AO = (function() {
  return this.display4$4
});
ScalaJS.c.sci_Vector.prototype.display2$und$eq__AO__V = (function(x$1) {
  this.display2$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.iterator__sc_Iterator = (function() {
  return this.iterator__sci_VectorIterator()
});
ScalaJS.c.sci_Vector.prototype.display1$und$eq__AO__V = (function(x$1) {
  this.display1$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.sci_Vector.prototype.display4$und$eq__AO__V = (function(x$1) {
  this.display4$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.length__I = (function() {
  return ((this.endIndex$4 - this.startIndex$4) | 0)
});
ScalaJS.c.sci_Vector.prototype.display1__AO = (function() {
  return this.display1$4
});
ScalaJS.c.sci_Vector.prototype.display5__AO = (function() {
  return this.display5$4
});
ScalaJS.c.sci_Vector.prototype.iterator__sci_VectorIterator = (function() {
  var s = new ScalaJS.c.sci_VectorIterator().init___I__I(this.startIndex$4, this.endIndex$4);
  this.initIterator__sci_VectorIterator__V(s);
  return s
});
ScalaJS.c.sci_Vector.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sci_Vector.prototype.depth$und$eq__I__V = (function(x$1) {
  this.depth$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.display2__AO = (function() {
  return this.display2$4
});
ScalaJS.c.sci_Vector.prototype.display0$und$eq__AO__V = (function(x$1) {
  this.display0$4 = x$1
});
ScalaJS.c.sci_Vector.prototype.display3$und$eq__AO__V = (function(x$1) {
  this.display3$4 = x$1
});
ScalaJS.d.sci_Vector = new ScalaJS.ClassTypeData({
  sci_Vector: 0
}, false, "scala.collection.immutable.Vector", {
  sci_Vector: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_IndexedSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  sci_VectorPointer: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1,
  sc_CustomParallelizable: 1
});
ScalaJS.c.sci_Vector.prototype.$classData = ScalaJS.d.sci_Vector;
/** @constructor */
ScalaJS.c.sci_$colon$colon = (function() {
  ScalaJS.c.sci_List.call(this);
  this.head$5 = null;
  this.tl$5 = null
});
ScalaJS.c.sci_$colon$colon.prototype = new ScalaJS.h.sci_List();
ScalaJS.c.sci_$colon$colon.prototype.constructor = ScalaJS.c.sci_$colon$colon;
/** @constructor */
ScalaJS.h.sci_$colon$colon = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_$colon$colon.prototype = ScalaJS.c.sci_$colon$colon.prototype;
ScalaJS.c.sci_$colon$colon.prototype.productPrefix__T = (function() {
  return "::"
});
ScalaJS.c.sci_$colon$colon.prototype.head__O = (function() {
  return this.head$5
});
ScalaJS.c.sci_$colon$colon.prototype.productArity__I = (function() {
  return 2
});
ScalaJS.c.sci_$colon$colon.prototype.isEmpty__Z = (function() {
  return false
});
ScalaJS.c.sci_$colon$colon.prototype.tail__sci_List = (function() {
  return this.tl$5
});
ScalaJS.c.sci_$colon$colon.prototype.productElement__I__O = (function(x$1) {
  switch (x$1) {
    case 0:
      {
        return this.head$5;
        break
      };
    case 1:
      {
        return this.tl$5;
        break
      };
    default:
      throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1));
  }
});
ScalaJS.c.sci_$colon$colon.prototype.tail__O = (function() {
  return this.tl$5
});
ScalaJS.c.sci_$colon$colon.prototype.init___O__sci_List = (function(head, tl) {
  this.head$5 = head;
  this.tl$5 = tl;
  return this
});
ScalaJS.c.sci_$colon$colon.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.d.sci_$colon$colon = new ScalaJS.ClassTypeData({
  sci_$colon$colon: 0
}, false, "scala.collection.immutable.$colon$colon", {
  sci_$colon$colon: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  Ljava_io_Serializable: 1,
  s_Serializable: 1
});
ScalaJS.c.sci_$colon$colon.prototype.$classData = ScalaJS.d.sci_$colon$colon;
/** @constructor */
ScalaJS.c.sci_Nil$ = (function() {
  ScalaJS.c.sci_List.call(this)
});
ScalaJS.c.sci_Nil$.prototype = new ScalaJS.h.sci_List();
ScalaJS.c.sci_Nil$.prototype.constructor = ScalaJS.c.sci_Nil$;
/** @constructor */
ScalaJS.h.sci_Nil$ = (function() {
  /*<skip>*/
});
ScalaJS.h.sci_Nil$.prototype = ScalaJS.c.sci_Nil$.prototype;
ScalaJS.c.sci_Nil$.prototype.head__O = (function() {
  this.head__sr_Nothing$()
});
ScalaJS.c.sci_Nil$.prototype.productPrefix__T = (function() {
  return "Nil"
});
ScalaJS.c.sci_Nil$.prototype.productArity__I = (function() {
  return 0
});
ScalaJS.c.sci_Nil$.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.sc_GenSeq(that)) {
    var x2 = ScalaJS.as.sc_GenSeq(that);
    return x2.isEmpty__Z()
  } else {
    return false
  }
});
ScalaJS.c.sci_Nil$.prototype.tail__sci_List = (function() {
  throw new ScalaJS.c.jl_UnsupportedOperationException().init___T("tail of empty list")
});
ScalaJS.c.sci_Nil$.prototype.isEmpty__Z = (function() {
  return true
});
ScalaJS.c.sci_Nil$.prototype.productElement__I__O = (function(x$1) {
  matchEnd3: {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + x$1))
  }
});
ScalaJS.c.sci_Nil$.prototype.head__sr_Nothing$ = (function() {
  throw new ScalaJS.c.ju_NoSuchElementException().init___T("head of empty list")
});
ScalaJS.c.sci_Nil$.prototype.tail__O = (function() {
  return this.tail__sci_List()
});
ScalaJS.c.sci_Nil$.prototype.productIterator__sc_Iterator = (function() {
  return new ScalaJS.c.sr_ScalaRunTime$$anon$1().init___s_Product(this)
});
ScalaJS.d.sci_Nil$ = new ScalaJS.ClassTypeData({
  sci_Nil$: 0
}, false, "scala.collection.immutable.Nil$", {
  sci_Nil$: 1,
  sci_List: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  sci_LinearSeq: 1,
  sci_Seq: 1,
  sci_Iterable: 1,
  sci_Traversable: 1,
  s_Immutable: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  s_Product: 1,
  sc_LinearSeqOptimized: 1,
  Ljava_io_Serializable: 1,
  s_Serializable: 1
});
ScalaJS.c.sci_Nil$.prototype.$classData = ScalaJS.d.sci_Nil$;
ScalaJS.n.sci_Nil$ = (void 0);
ScalaJS.m.sci_Nil$ = (function() {
  if ((!ScalaJS.n.sci_Nil$)) {
    ScalaJS.n.sci_Nil$ = new ScalaJS.c.sci_Nil$().init___()
  };
  return ScalaJS.n.sci_Nil$
});
/** @constructor */
ScalaJS.c.scm_LinkedList = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this);
  this.elem$5 = null;
  this.next$5 = null
});
ScalaJS.c.scm_LinkedList.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_LinkedList.prototype.constructor = ScalaJS.c.scm_LinkedList;
/** @constructor */
ScalaJS.h.scm_LinkedList = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_LinkedList.prototype = ScalaJS.c.scm_LinkedList.prototype;
ScalaJS.c.scm_LinkedList.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_LinkedList.prototype.head__O = (function() {
  return ScalaJS.s.scm_LinkedListLike$class__head__scm_LinkedListLike__O(this)
});
ScalaJS.c.scm_LinkedList.prototype.init___ = (function() {
  this.next$5 = this;
  return this
});
ScalaJS.c.scm_LinkedList.prototype.apply__O__O = (function(v1) {
  var n = ScalaJS.uI(v1);
  return ScalaJS.s.scm_LinkedListLike$class__apply__scm_LinkedListLike__I__O(this, n)
});
ScalaJS.c.scm_LinkedList.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.scm_LinkedListLike$class__isEmpty__scm_LinkedListLike__Z(this)
});
ScalaJS.c.scm_LinkedList.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_LinkedList.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_LinkedList$()
});
ScalaJS.c.scm_LinkedList.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.scm_LinkedListLike$class__foreach__scm_LinkedListLike__F1__V(this, f)
});
ScalaJS.c.scm_LinkedList.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.scm_LinkedListLike$$anon$1().init___scm_LinkedListLike(this)
});
ScalaJS.c.scm_LinkedList.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.scm_LinkedList.prototype.length__I = (function() {
  return ScalaJS.s.scm_LinkedListLike$class__length0__p0__scm_LinkedListLike__scm_Seq__I__I(this, this, 0)
});
ScalaJS.c.scm_LinkedList.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_LinkedList.prototype.tail__O = (function() {
  return ScalaJS.s.scm_LinkedListLike$class__tail__scm_LinkedListLike__scm_Seq(this)
});
ScalaJS.c.scm_LinkedList.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.scm_LinkedList.prototype.init___O__scm_LinkedList = (function(elem, next) {
  ScalaJS.c.scm_LinkedList.prototype.init___.call(this);
  if ((next !== null)) {
    this.elem$5 = elem;
    this.next$5 = next
  };
  return this
});
ScalaJS.is.scm_LinkedList = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_LinkedList)))
});
ScalaJS.as.scm_LinkedList = (function(obj) {
  return ((ScalaJS.is.scm_LinkedList(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.LinkedList"))
});
ScalaJS.isArrayOf.scm_LinkedList = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_LinkedList)))
});
ScalaJS.asArrayOf.scm_LinkedList = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_LinkedList(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.LinkedList;", depth))
});
ScalaJS.d.scm_LinkedList = new ScalaJS.ClassTypeData({
  scm_LinkedList: 0
}, false, "scala.collection.mutable.LinkedList", {
  scm_LinkedList: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  scm_LinkedListLike: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_LinkedList.prototype.$classData = ScalaJS.d.scm_LinkedList;
/** @constructor */
ScalaJS.c.scm_AbstractBuffer = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this)
});
ScalaJS.c.scm_AbstractBuffer.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_AbstractBuffer.prototype.constructor = ScalaJS.c.scm_AbstractBuffer;
/** @constructor */
ScalaJS.h.scm_AbstractBuffer = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_AbstractBuffer.prototype = ScalaJS.c.scm_AbstractBuffer.prototype;
ScalaJS.c.scm_AbstractBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
/** @constructor */
ScalaJS.c.scm_MutableList = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this);
  this.first0$5 = null;
  this.last0$5 = null;
  this.len$5 = 0
});
ScalaJS.c.scm_MutableList.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_MutableList.prototype.constructor = ScalaJS.c.scm_MutableList;
/** @constructor */
ScalaJS.h.scm_MutableList = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_MutableList.prototype = ScalaJS.c.scm_MutableList.prototype;
ScalaJS.c.scm_MutableList.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_MutableList.prototype.head__O = (function() {
  if (ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this)) {
    var this$1 = this.first0$5;
    return ScalaJS.s.scm_LinkedListLike$class__head__scm_LinkedListLike__O(this$1)
  } else {
    throw new ScalaJS.c.ju_NoSuchElementException().init___()
  }
});
ScalaJS.c.scm_MutableList.prototype.init___ = (function() {
  this.first0$5 = new ScalaJS.c.scm_LinkedList().init___();
  this.last0$5 = this.first0$5;
  this.len$5 = 0;
  return this
});
ScalaJS.c.scm_MutableList.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this, len)
});
ScalaJS.c.scm_MutableList.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.scm_MutableList.prototype.apply__O__O = (function(v1) {
  var n = ScalaJS.uI(v1);
  var this$1 = this.first0$5;
  return ScalaJS.s.scm_LinkedListLike$class__apply__scm_LinkedListLike__I__O(this$1, n)
});
ScalaJS.c.scm_MutableList.prototype.isEmpty__Z = (function() {
  return (this.len$5 === 0)
});
ScalaJS.c.scm_MutableList.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_MutableList.prototype.prependElem__O__V = (function(elem) {
  this.first0$5 = new ScalaJS.c.scm_LinkedList().init___O__scm_LinkedList(elem, this.first0$5);
  if ((this.len$5 === 0)) {
    this.last0$5 = this.first0$5
  };
  this.len$5 = ((1 + this.len$5) | 0)
});
ScalaJS.c.scm_MutableList.prototype.drop__I__sc_LinearSeqOptimized = (function(n) {
  return ScalaJS.s.sc_LinearSeqOptimized$class__drop__sc_LinearSeqOptimized__I__sc_LinearSeqOptimized(this, n)
});
ScalaJS.c.scm_MutableList.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_MutableList(elem)
});
ScalaJS.c.scm_MutableList.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_MutableList$()
});
ScalaJS.c.scm_MutableList.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_LinearSeqOptimized$class__foreach__sc_LinearSeqOptimized__F1__V(this, f)
});
ScalaJS.c.scm_MutableList.prototype.tailImpl__scm_MutableList__V = (function(tl) {
  var requirement = ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this);
  if ((!requirement)) {
    throw new ScalaJS.c.jl_IllegalArgumentException().init___T(("requirement failed: " + "tail of empty list"))
  };
  var this$2 = this.first0$5;
  tl.first0$5 = ScalaJS.as.scm_LinkedList(ScalaJS.s.scm_LinkedListLike$class__tail__scm_LinkedListLike__scm_Seq(this$2));
  tl.len$5 = (((-1) + this.len$5) | 0);
  tl.last0$5 = ((tl.len$5 === 0) ? tl.first0$5 : this.last0$5)
});
ScalaJS.c.scm_MutableList.prototype.result__O = (function() {
  return this
});
ScalaJS.c.scm_MutableList.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.first0$5;
  return new ScalaJS.c.scm_LinkedListLike$$anon$1().init___scm_LinkedListLike(this$1)
});
ScalaJS.c.scm_MutableList.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.scm_MutableList.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_MutableList.prototype.length__I = (function() {
  return this.len$5
});
ScalaJS.c.scm_MutableList.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_MutableList.prototype.last__O = (function() {
  if (this.isEmpty__Z()) {
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("MutableList.empty.last")
  };
  return this.last0$5.elem$5
});
ScalaJS.c.scm_MutableList.prototype.tail__O = (function() {
  return this.tail__scm_MutableList()
});
ScalaJS.c.scm_MutableList.prototype.appendElem__O__V = (function(elem) {
  if ((this.len$5 === 0)) {
    this.prependElem__O__V(elem)
  } else {
    this.last0$5.next$5 = new ScalaJS.c.scm_LinkedList().init___();
    this.last0$5 = ScalaJS.as.scm_LinkedList(this.last0$5.next$5);
    this.last0$5.elem$5 = elem;
    this.last0$5.next$5 = new ScalaJS.c.scm_LinkedList().init___();
    this.len$5 = ((1 + this.len$5) | 0)
  }
});
ScalaJS.c.scm_MutableList.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_MutableList(elem)
});
ScalaJS.c.scm_MutableList.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_MutableList.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.scm_MutableList.prototype.$$plus$eq__O__scm_MutableList = (function(elem) {
  this.appendElem__O__V(elem);
  return this
});
ScalaJS.c.scm_MutableList.prototype.tail__scm_MutableList = (function() {
  var tl = new ScalaJS.c.scm_MutableList().init___();
  this.tailImpl__scm_MutableList__V(tl);
  return tl
});
ScalaJS.c.scm_MutableList.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_MutableList().init___()
});
ScalaJS.c.scm_MutableList.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.is.scm_MutableList = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_MutableList)))
});
ScalaJS.as.scm_MutableList = (function(obj) {
  return ((ScalaJS.is.scm_MutableList(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.MutableList"))
});
ScalaJS.isArrayOf.scm_MutableList = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_MutableList)))
});
ScalaJS.asArrayOf.scm_MutableList = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_MutableList(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.MutableList;", depth))
});
ScalaJS.d.scm_MutableList = new ScalaJS.ClassTypeData({
  scm_MutableList: 0
}, false, "scala.collection.mutable.MutableList", {
  scm_MutableList: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_MutableList.prototype.$classData = ScalaJS.d.scm_MutableList;
/** @constructor */
ScalaJS.c.scm_Queue = (function() {
  ScalaJS.c.scm_MutableList.call(this)
});
ScalaJS.c.scm_Queue.prototype = new ScalaJS.h.scm_MutableList();
ScalaJS.c.scm_Queue.prototype.constructor = ScalaJS.c.scm_Queue;
/** @constructor */
ScalaJS.h.scm_Queue = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_Queue.prototype = ScalaJS.c.scm_Queue.prototype;
ScalaJS.c.scm_Queue.prototype.init___scm_LinkedList__scm_LinkedList__I = (function(fst, lst, lng) {
  ScalaJS.c.scm_Queue.prototype.init___.call(this);
  this.first0$5 = fst;
  this.last0$5 = lst;
  this.len$5 = lng;
  return this
});
ScalaJS.c.scm_Queue.prototype.dequeue__O = (function() {
  if (this.isEmpty__Z()) {
    throw new ScalaJS.c.ju_NoSuchElementException().init___T("queue empty")
  } else {
    var res = this.first0$5.elem$5;
    this.first0$5 = ScalaJS.as.scm_LinkedList(this.first0$5.next$5);
    this.decrementLength__p6__V();
    return res
  }
});
ScalaJS.c.scm_Queue.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_Queue.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_Queue$()
});
ScalaJS.c.scm_Queue.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_Queue.prototype.tail__O = (function() {
  return this.tail__scm_Queue()
});
ScalaJS.c.scm_Queue.prototype.decrementLength__p6__V = (function() {
  this.len$5 = (((-1) + this.len$5) | 0);
  if ((this.len$5 === 0)) {
    this.last0$5 = this.first0$5
  }
});
ScalaJS.c.scm_Queue.prototype.tail__scm_Queue = (function() {
  var tl = new ScalaJS.c.scm_Queue().init___();
  this.tailImpl__scm_MutableList__V(tl);
  return tl
});
ScalaJS.c.scm_Queue.prototype.tail__scm_MutableList = (function() {
  return this.tail__scm_Queue()
});
ScalaJS.c.scm_Queue.prototype.newBuilder__scm_Builder = (function() {
  return ScalaJS.m.scm_Queue$().newBuilder__scm_Builder()
});
ScalaJS.is.scm_Queue = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_Queue)))
});
ScalaJS.as.scm_Queue = (function(obj) {
  return ((ScalaJS.is.scm_Queue(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.Queue"))
});
ScalaJS.isArrayOf.scm_Queue = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_Queue)))
});
ScalaJS.asArrayOf.scm_Queue = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_Queue(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.Queue;", depth))
});
ScalaJS.d.scm_Queue = new ScalaJS.ClassTypeData({
  scm_Queue: 0
}, false, "scala.collection.mutable.Queue", {
  scm_Queue: 1,
  scm_MutableList: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_LinearSeq: 1,
  sc_LinearSeq: 1,
  sc_LinearSeqLike: 1,
  sc_LinearSeqOptimized: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_Queue.prototype.$classData = ScalaJS.d.scm_Queue;
/** @constructor */
ScalaJS.c.scm_ListBuffer = (function() {
  ScalaJS.c.scm_AbstractBuffer.call(this);
  this.scala$collection$mutable$ListBuffer$$start$6 = null;
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
ScalaJS.c.scm_ListBuffer.prototype = new ScalaJS.h.scm_AbstractBuffer();
ScalaJS.c.scm_ListBuffer.prototype.constructor = ScalaJS.c.scm_ListBuffer;
/** @constructor */
ScalaJS.h.scm_ListBuffer = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ListBuffer.prototype = ScalaJS.c.scm_ListBuffer.prototype;
ScalaJS.c.scm_ListBuffer.prototype.copy__p6__V = (function() {
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    return (void 0)
  };
  var cursor = this.scala$collection$mutable$ListBuffer$$start$6;
  var this$1 = this.last0$6;
  var limit = this$1.tl$5;
  this.clear__V();
  while ((cursor !== limit)) {
    this.$$plus$eq__O__scm_ListBuffer(cursor.head__O());
    var this$2 = cursor;
    cursor = this$2.tail__sci_List()
  }
});
ScalaJS.c.scm_ListBuffer.prototype.init___ = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = ScalaJS.m.sci_Nil$();
  this.exported$6 = false;
  this.len$6 = 0;
  return this
});
ScalaJS.c.scm_ListBuffer.prototype.apply__I__O = (function(n) {
  if (((n < 0) || (n >= this.len$6))) {
    throw new ScalaJS.c.jl_IndexOutOfBoundsException().init___T(("" + n))
  } else {
    var this$2 = this.scala$collection$mutable$ListBuffer$$start$6;
    return ScalaJS.s.sc_LinearSeqOptimized$class__apply__sc_LinearSeqOptimized__I__O(this$2, n)
  }
});
ScalaJS.c.scm_ListBuffer.prototype.lengthCompare__I__I = (function(len) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_LinearSeqOptimized$class__lengthCompare__sc_LinearSeqOptimized__I__I(this$1, len)
});
ScalaJS.c.scm_ListBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_LinearSeqOptimized$class__sameElements__sc_LinearSeqOptimized__sc_GenIterable__Z(this$1, that)
});
ScalaJS.c.scm_ListBuffer.prototype.apply__O__O = (function(v1) {
  return this.apply__I__O(ScalaJS.uI(v1))
});
ScalaJS.c.scm_ListBuffer.prototype.isEmpty__Z = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()
});
ScalaJS.c.scm_ListBuffer.prototype.toList__sci_List = (function() {
  this.exported$6 = (!this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z());
  return this.scala$collection$mutable$ListBuffer$$start$6
});
ScalaJS.c.scm_ListBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_ListBuffer.prototype.equals__O__Z = (function(that) {
  if (ScalaJS.is.scm_ListBuffer(that)) {
    var x2 = ScalaJS.as.scm_ListBuffer(that);
    return this.scala$collection$mutable$ListBuffer$$start$6.equals__O__Z(x2.scala$collection$mutable$ListBuffer$$start$6)
  } else {
    return ScalaJS.s.sc_GenSeqLike$class__equals__sc_GenSeqLike__O__Z(this, that)
  }
});
ScalaJS.c.scm_ListBuffer.prototype.mkString__T__T__T__T = (function(start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_TraversableOnce$class__mkString__sc_TraversableOnce__T__T__T__T(this$1, start, sep, end)
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
ScalaJS.c.scm_ListBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_ListBuffer$()
});
ScalaJS.c.scm_ListBuffer.prototype.foreach__F1__V = (function(f) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  var these = this$1;
  while ((!these.isEmpty__Z())) {
    f.apply__O__O(these.head__O());
    var this$2 = these;
    these = this$2.tail__sci_List()
  }
});
ScalaJS.c.scm_ListBuffer.prototype.size__I = (function() {
  return this.len$6
});
ScalaJS.c.scm_ListBuffer.prototype.result__O = (function() {
  return this.toList__sci_List()
});
ScalaJS.c.scm_ListBuffer.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.scm_ListBuffer$$anon$1().init___scm_ListBuffer(this)
});
ScalaJS.c.scm_ListBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_ListBuffer.prototype.length__I = (function() {
  return this.len$6
});
ScalaJS.c.scm_ListBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_ListBuffer.prototype.toStream__sci_Stream = (function() {
  return this.scala$collection$mutable$ListBuffer$$start$6.toStream__sci_Stream()
});
ScalaJS.c.scm_ListBuffer.prototype.addString__scm_StringBuilder__T__T__T__scm_StringBuilder = (function(b, start, sep, end) {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_TraversableOnce$class__addString__sc_TraversableOnce__scm_StringBuilder__T__T__T__scm_StringBuilder(this$1, b, start, sep, end)
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$eq__O__scm_ListBuffer = (function(x) {
  if (this.exported$6) {
    this.copy__p6__V()
  };
  if (this.scala$collection$mutable$ListBuffer$$start$6.isEmpty__Z()) {
    this.last0$6 = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(x, ScalaJS.m.sci_Nil$());
    this.scala$collection$mutable$ListBuffer$$start$6 = this.last0$6
  } else {
    var last1 = this.last0$6;
    this.last0$6 = new ScalaJS.c.sci_$colon$colon().init___O__sci_List(x, ScalaJS.m.sci_Nil$());
    last1.tl$5 = this.last0$6
  };
  this.len$6 = ((1 + this.len$6) | 0);
  return this
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ListBuffer(elem)
});
ScalaJS.c.scm_ListBuffer.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_ListBuffer.prototype.clear__V = (function() {
  this.scala$collection$mutable$ListBuffer$$start$6 = ScalaJS.m.sci_Nil$();
  this.last0$6 = null;
  this.exported$6 = false;
  this.len$6 = 0
});
ScalaJS.c.scm_ListBuffer.prototype.nonEmpty__Z = (function() {
  var this$1 = this.scala$collection$mutable$ListBuffer$$start$6;
  return ScalaJS.s.sc_TraversableOnce$class__nonEmpty__sc_TraversableOnce__Z(this$1)
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer = (function(xs) {
  _$plus$plus$eq: while (true) {
    var x1 = xs;
    if ((x1 !== null)) {
      if ((x1 === this)) {
        var n = this.len$6;
        xs = ScalaJS.as.sc_TraversableOnce(ScalaJS.s.sc_IterableLike$class__take__sc_IterableLike__I__O(this, n));
        continue _$plus$plus$eq
      }
    };
    return ScalaJS.as.scm_ListBuffer(ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
ScalaJS.c.scm_ListBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ListBuffer(xs)
});
ScalaJS.c.scm_ListBuffer.prototype.stringPrefix__T = (function() {
  return "ListBuffer"
});
ScalaJS.is.scm_ListBuffer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ListBuffer)))
});
ScalaJS.as.scm_ListBuffer = (function(obj) {
  return ((ScalaJS.is.scm_ListBuffer(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.ListBuffer"))
});
ScalaJS.isArrayOf.scm_ListBuffer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ListBuffer)))
});
ScalaJS.asArrayOf.scm_ListBuffer = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_ListBuffer(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.ListBuffer;", depth))
});
ScalaJS.d.scm_ListBuffer = new ScalaJS.ClassTypeData({
  scm_ListBuffer: 0
}, false, "scala.collection.mutable.ListBuffer", {
  scm_ListBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_Builder: 1,
  scg_SeqForwarder: 1,
  scg_IterableForwarder: 1,
  scg_TraversableForwarder: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ListBuffer.prototype.$classData = ScalaJS.d.scm_ListBuffer;
/** @constructor */
ScalaJS.c.scm_StringBuilder = (function() {
  ScalaJS.c.scm_AbstractSeq.call(this);
  this.underlying$5 = null
});
ScalaJS.c.scm_StringBuilder.prototype = new ScalaJS.h.scm_AbstractSeq();
ScalaJS.c.scm_StringBuilder.prototype.constructor = ScalaJS.c.scm_StringBuilder;
/** @constructor */
ScalaJS.h.scm_StringBuilder = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_StringBuilder.prototype = ScalaJS.c.scm_StringBuilder.prototype;
ScalaJS.c.scm_StringBuilder.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$eq__C__scm_StringBuilder = (function(x) {
  this.append__C__scm_StringBuilder(x);
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.init___ = (function() {
  ScalaJS.c.scm_StringBuilder.prototype.init___I__T.call(this, 16, "");
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.apply__I__O = (function(idx) {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & ScalaJS.uI(thiz["charCodeAt"](idx)));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.scm_StringBuilder.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.scm_StringBuilder.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.scm_StringBuilder.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  var c = (65535 & ScalaJS.uI(thiz["charCodeAt"](index)));
  return new ScalaJS.c.jl_Character().init___C(c)
});
ScalaJS.c.scm_StringBuilder.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.scm_StringBuilder.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = ScalaJS.as.jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
ScalaJS.c.scm_StringBuilder.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_IndexedSeq$()
});
ScalaJS.c.scm_StringBuilder.prototype.toString__T = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
ScalaJS.c.scm_StringBuilder.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.scm_StringBuilder.prototype.result__O = (function() {
  var this$1 = this.underlying$5;
  return this$1.content$1
});
ScalaJS.c.scm_StringBuilder.prototype.append__T__scm_StringBuilder = (function(s) {
  this.underlying$5.append__T__jl_StringBuilder(s);
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.iterator__sc_Iterator = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI(thiz["length"]))
});
ScalaJS.c.scm_StringBuilder.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_StringBuilder.prototype.init___I__T = (function(initCapacity, initValue) {
  ScalaJS.c.scm_StringBuilder.prototype.init___jl_StringBuilder.call(this, new ScalaJS.c.jl_StringBuilder().init___I(((ScalaJS.uI(initValue["length"]) + initCapacity) | 0)).append__T__jl_StringBuilder(initValue));
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.length__I = (function() {
  var this$1 = this.underlying$5;
  var thiz = this$1.content$1;
  return ScalaJS.uI(thiz["length"])
});
ScalaJS.c.scm_StringBuilder.prototype.init___jl_StringBuilder = (function(underlying) {
  this.underlying$5 = underlying;
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.append__O__scm_StringBuilder = (function(x) {
  this.underlying$5.append__T__jl_StringBuilder(ScalaJS.m.sjsr_RuntimeString$().valueOf__O__T(x));
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  if ((elem === null)) {
    var jsx$1 = 0
  } else {
    var this$2 = ScalaJS.as.jl_Character(elem);
    var jsx$1 = this$2.value$1
  };
  return this.$$plus$eq__C__scm_StringBuilder(jsx$1)
});
ScalaJS.c.scm_StringBuilder.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
ScalaJS.c.scm_StringBuilder.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.scm_StringBuilder.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.scm_StringBuilder.prototype.append__C__scm_StringBuilder = (function(x) {
  this.underlying$5.append__C__jl_StringBuilder(x);
  return this
});
ScalaJS.c.scm_StringBuilder.prototype.newBuilder__scm_Builder = (function() {
  return new ScalaJS.c.scm_GrowingBuilder().init___scg_Growable(new ScalaJS.c.scm_StringBuilder().init___())
});
ScalaJS.c.scm_StringBuilder.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs)
});
ScalaJS.d.scm_StringBuilder = new ScalaJS.ClassTypeData({
  scm_StringBuilder: 0
}, false, "scala.collection.mutable.StringBuilder", {
  scm_StringBuilder: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  jl_CharSequence: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  sci_StringLike: 1,
  sc_IndexedSeqOptimized: 1,
  s_math_Ordered: 1,
  jl_Comparable: 1,
  scm_Builder: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_StringBuilder.prototype.$classData = ScalaJS.d.scm_StringBuilder;
/** @constructor */
ScalaJS.c.sjs_js_WrappedArray = (function() {
  ScalaJS.c.scm_AbstractBuffer.call(this);
  this.array$6 = null
});
ScalaJS.c.sjs_js_WrappedArray.prototype = new ScalaJS.h.scm_AbstractBuffer();
ScalaJS.c.sjs_js_WrappedArray.prototype.constructor = ScalaJS.c.sjs_js_WrappedArray;
/** @constructor */
ScalaJS.h.sjs_js_WrappedArray = (function() {
  /*<skip>*/
});
ScalaJS.h.sjs_js_WrappedArray.prototype = ScalaJS.c.sjs_js_WrappedArray.prototype;
ScalaJS.c.sjs_js_WrappedArray.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.init___ = (function() {
  ScalaJS.c.sjs_js_WrappedArray.prototype.init___sjs_js_Array.call(this, []);
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.apply__I__O = (function(index) {
  return this.array$6[index]
});
ScalaJS.c.sjs_js_WrappedArray.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.apply__O__O = (function(v1) {
  var index = ScalaJS.uI(v1);
  return this.array$6[index]
});
ScalaJS.c.sjs_js_WrappedArray.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  this.array$6["push"](elem);
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.sjs_js_WrappedArray$()
});
ScalaJS.c.sjs_js_WrappedArray.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__foreach__sc_IndexedSeqOptimized__F1__V(this, f)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.result__O = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, ScalaJS.uI(this.array$6["length"]))
});
ScalaJS.c.sjs_js_WrappedArray.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.length__I = (function() {
  return ScalaJS.uI(this.array$6["length"])
});
ScalaJS.c.sjs_js_WrappedArray.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  this.array$6["push"](elem);
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.sizeHint__I__V = (function(size) {
  /*<skip>*/
});
ScalaJS.c.sjs_js_WrappedArray.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.sc_IndexedSeqOptimized$class__copyToArray__sc_IndexedSeqOptimized__O__I__I__V(this, xs, start, len)
});
ScalaJS.c.sjs_js_WrappedArray.prototype.init___sjs_js_Array = (function(array) {
  this.array$6 = array;
  return this
});
ScalaJS.c.sjs_js_WrappedArray.prototype.stringPrefix__T = (function() {
  return "WrappedArray"
});
ScalaJS.d.sjs_js_WrappedArray = new ScalaJS.ClassTypeData({
  sjs_js_WrappedArray: 0
}, false, "scala.scalajs.js.WrappedArray", {
  sjs_js_WrappedArray: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_IndexedSeqLike: 1,
  scm_IndexedSeqLike: 1,
  scm_ArrayLike: 1,
  scm_IndexedSeqOptimized: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1
});
ScalaJS.c.sjs_js_WrappedArray.prototype.$classData = ScalaJS.d.sjs_js_WrappedArray;
/** @constructor */
ScalaJS.c.scm_ArrayBuffer = (function() {
  ScalaJS.c.scm_AbstractBuffer.call(this);
  this.initialSize$6 = 0;
  this.array$6 = null;
  this.size0$6 = 0
});
ScalaJS.c.scm_ArrayBuffer.prototype = new ScalaJS.h.scm_AbstractBuffer();
ScalaJS.c.scm_ArrayBuffer.prototype.constructor = ScalaJS.c.scm_ArrayBuffer;
/** @constructor */
ScalaJS.h.scm_ArrayBuffer = (function() {
  /*<skip>*/
});
ScalaJS.h.scm_ArrayBuffer.prototype = ScalaJS.c.scm_ArrayBuffer.prototype;
ScalaJS.c.scm_ArrayBuffer.prototype.seq__sc_TraversableOnce = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.init___ = (function() {
  ScalaJS.c.scm_ArrayBuffer.prototype.init___I.call(this, 16);
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$eq__O__scm_ArrayBuffer = (function(elem) {
  var n = ((1 + this.size0$6) | 0);
  ScalaJS.s.scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V(this, n);
  this.array$6.u[this.size0$6] = elem;
  this.size0$6 = ((1 + this.size0$6) | 0);
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.apply__I__O = (function(idx) {
  return ScalaJS.s.scm_ResizableArray$class__apply__scm_ResizableArray__I__O(this, idx)
});
ScalaJS.c.scm_ArrayBuffer.prototype.lengthCompare__I__I = (function(len) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__lengthCompare__sc_IndexedSeqOptimized__I__I(this, len)
});
ScalaJS.c.scm_ArrayBuffer.prototype.apply__O__O = (function(v1) {
  var idx = ScalaJS.uI(v1);
  return ScalaJS.s.scm_ResizableArray$class__apply__scm_ResizableArray__I__O(this, idx)
});
ScalaJS.c.scm_ArrayBuffer.prototype.sameElements__sc_GenIterable__Z = (function(that) {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__sameElements__sc_IndexedSeqOptimized__sc_GenIterable__Z(this, that)
});
ScalaJS.c.scm_ArrayBuffer.prototype.isEmpty__Z = (function() {
  return ScalaJS.s.sc_IndexedSeqOptimized$class__isEmpty__sc_IndexedSeqOptimized__Z(this)
});
ScalaJS.c.scm_ArrayBuffer.prototype.thisCollection__sc_Traversable = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$eq__O__scg_Growable = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
ScalaJS.c.scm_ArrayBuffer.prototype.companion__scg_GenericCompanion = (function() {
  return ScalaJS.m.scm_ArrayBuffer$()
});
ScalaJS.c.scm_ArrayBuffer.prototype.foreach__F1__V = (function(f) {
  ScalaJS.s.scm_ResizableArray$class__foreach__scm_ResizableArray__F1__V(this, f)
});
ScalaJS.c.scm_ArrayBuffer.prototype.result__O = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.seq__scm_Seq = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.iterator__sc_Iterator = (function() {
  return new ScalaJS.c.sc_IndexedSeqLike$Elements().init___sc_IndexedSeqLike__I__I(this, 0, this.size0$6)
});
ScalaJS.c.scm_ArrayBuffer.prototype.init___I = (function(initialSize) {
  this.initialSize$6 = initialSize;
  ScalaJS.s.scm_ResizableArray$class__$$init$__scm_ResizableArray__V(this);
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.sizeHintBounded__I__sc_TraversableLike__V = (function(size, boundingColl) {
  ScalaJS.s.scm_Builder$class__sizeHintBounded__scm_Builder__I__sc_TraversableLike__V(this, size, boundingColl)
});
ScalaJS.c.scm_ArrayBuffer.prototype.seq__sc_Seq = (function() {
  return this
});
ScalaJS.c.scm_ArrayBuffer.prototype.length__I = (function() {
  return this.size0$6
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer = (function(xs) {
  if (ScalaJS.is.sc_IndexedSeqLike(xs)) {
    var x2 = ScalaJS.as.sc_IndexedSeqLike(xs);
    var n = x2.length__I();
    var n$1 = ((this.size0$6 + n) | 0);
    ScalaJS.s.scm_ResizableArray$class__ensureSize__scm_ResizableArray__I__V(this, n$1);
    x2.copyToArray__O__I__I__V(this.array$6, this.size0$6, n);
    this.size0$6 = ((this.size0$6 + n) | 0);
    return this
  } else {
    return ScalaJS.as.scm_ArrayBuffer(ScalaJS.s.scg_Growable$class__$$plus$plus$eq__scg_Growable__sc_TraversableOnce__scg_Growable(this, xs))
  }
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$eq__O__scm_Builder = (function(elem) {
  return this.$$plus$eq__O__scm_ArrayBuffer(elem)
});
ScalaJS.c.scm_ArrayBuffer.prototype.copyToArray__O__I__I__V = (function(xs, start, len) {
  ScalaJS.s.scm_ResizableArray$class__copyToArray__scm_ResizableArray__O__I__I__V(this, xs, start, len)
});
ScalaJS.c.scm_ArrayBuffer.prototype.hashCode__I = (function() {
  return ScalaJS.m.s_util_hashing_MurmurHash3$().seqHash__sc_Seq__I(this)
});
ScalaJS.c.scm_ArrayBuffer.prototype.sizeHint__I__V = (function(len) {
  if (((len > this.size0$6) && (len >= 1))) {
    var newarray = ScalaJS.newArrayObject(ScalaJS.d.O.getArrayOf(), [len]);
    var src = this.array$6;
    var length = this.size0$6;
    ScalaJS.systemArraycopy(src, 0, newarray, 0, length);
    this.array$6 = newarray
  }
});
ScalaJS.c.scm_ArrayBuffer.prototype.$$plus$plus$eq__sc_TraversableOnce__scg_Growable = (function(xs) {
  return this.$$plus$plus$eq__sc_TraversableOnce__scm_ArrayBuffer(xs)
});
ScalaJS.c.scm_ArrayBuffer.prototype.stringPrefix__T = (function() {
  return "ArrayBuffer"
});
ScalaJS.is.scm_ArrayBuffer = (function(obj) {
  return (!(!((obj && obj.$classData) && obj.$classData.ancestors.scm_ArrayBuffer)))
});
ScalaJS.as.scm_ArrayBuffer = (function(obj) {
  return ((ScalaJS.is.scm_ArrayBuffer(obj) || (obj === null)) ? obj : ScalaJS.throwClassCastException(obj, "scala.collection.mutable.ArrayBuffer"))
});
ScalaJS.isArrayOf.scm_ArrayBuffer = (function(obj, depth) {
  return (!(!(((obj && obj.$classData) && (obj.$classData.arrayDepth === depth)) && obj.$classData.arrayBase.ancestors.scm_ArrayBuffer)))
});
ScalaJS.asArrayOf.scm_ArrayBuffer = (function(obj, depth) {
  return ((ScalaJS.isArrayOf.scm_ArrayBuffer(obj, depth) || (obj === null)) ? obj : ScalaJS.throwArrayCastException(obj, "Lscala.collection.mutable.ArrayBuffer;", depth))
});
ScalaJS.d.scm_ArrayBuffer = new ScalaJS.ClassTypeData({
  scm_ArrayBuffer: 0
}, false, "scala.collection.mutable.ArrayBuffer", {
  scm_ArrayBuffer: 1,
  scm_AbstractBuffer: 1,
  scm_AbstractSeq: 1,
  sc_AbstractSeq: 1,
  sc_AbstractIterable: 1,
  sc_AbstractTraversable: 1,
  O: 1,
  sc_Traversable: 1,
  sc_TraversableLike: 1,
  scg_HasNewBuilder: 1,
  scg_FilterMonadic: 1,
  sc_TraversableOnce: 1,
  sc_GenTraversableOnce: 1,
  sc_GenTraversableLike: 1,
  sc_Parallelizable: 1,
  sc_GenTraversable: 1,
  scg_GenericTraversableTemplate: 1,
  sc_Iterable: 1,
  sc_GenIterable: 1,
  sc_GenIterableLike: 1,
  sc_IterableLike: 1,
  s_Equals: 1,
  sc_Seq: 1,
  s_PartialFunction: 1,
  F1: 1,
  sc_GenSeq: 1,
  sc_GenSeqLike: 1,
  sc_SeqLike: 1,
  scm_Seq: 1,
  scm_Iterable: 1,
  scm_Traversable: 1,
  s_Mutable: 1,
  scm_SeqLike: 1,
  scm_Cloneable: 1,
  s_Cloneable: 1,
  jl_Cloneable: 1,
  scm_Buffer: 1,
  scm_BufferLike: 1,
  scg_Growable: 1,
  scg_Clearable: 1,
  scg_Shrinkable: 1,
  sc_script_Scriptable: 1,
  scg_Subtractable: 1,
  scm_IndexedSeqOptimized: 1,
  scm_IndexedSeqLike: 1,
  sc_IndexedSeqLike: 1,
  sc_IndexedSeqOptimized: 1,
  scm_Builder: 1,
  scm_ResizableArray: 1,
  scm_IndexedSeq: 1,
  sc_IndexedSeq: 1,
  sc_CustomParallelizable: 1,
  s_Serializable: 1,
  Ljava_io_Serializable: 1
});
ScalaJS.c.scm_ArrayBuffer.prototype.$classData = ScalaJS.d.scm_ArrayBuffer;
//# sourceMappingURL=snake-fastopt.js.map
