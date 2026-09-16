// 阶段2：根据编译报错自动补全缺失的 using 指令
import { readFileSync } from "node:fs";
import { addUsings, hasUsing, applyTransform } from "./csharp3-fix-lib.mjs";

// 常见 BCL 类型 → 命名空间（仅 .NET 8 共享框架内置、无需 NuGet 的）
const NS_MAP = {
  "System.Text": [
    "Encoding", "UTF8Encoding", "UnicodeEncoding", "ASCIIEncoding", "UTF32Encoding",
    "StringBuilder", "Rune", "Decoder", "Encoder", "ASCII", "NormalizationForm",
  ],
  "System.Text.Json": [
    "JsonSerializer", "JsonDocument", "JsonElement", "JsonSerializerOptions",
    "JsonProperty", "Utf8JsonWriter", "Utf8JsonReader", "JsonNode", "JsonArray",
    "JsonWriterOptions", "JsonReaderOptions", "JsonException",
    "JsonNamingPolicy", "JsonCommentHandling", "JsonSerializerDefaults", "JsonEncodedText",
  ],
  "System.Text.Json.Serialization": [
    "JsonPropertyName", "JsonIgnore", "JsonConverter", "JsonInclude", "JsonNumberHandling",
    "JsonIgnoreCondition", "ReferenceHandler", "JsonStringEnumConverter",
  ],
  "System.Text.RegularExpressions": [
    "Regex", "Match", "MatchCollection", "Group", "GroupCollection", "Capture",
    "CaptureCollection", "RegexOptions", "RegexTimeoutException",
  ],
  "System.Text.Encodings.Web": ["JavaScriptEncoder", "HtmlEncoder", "UrlEncoder"],
  "System.Text.Json.Nodes": ["JsonNode", "JsonArray", "JsonObject", "JsonValue"],
  "System.Reflection": [
    "PropertyInfo", "MethodInfo", "FieldInfo", "ConstructorInfo", "EventInfo",
    "MemberInfo", "MethodBase", "BindingFlags", "Assembly", "Module", "ParameterInfo",
    "CustomAttributeData", "CustomAttributeExtensions", "Binder", "TypeInfo", "Missing",
  ],
  "System.Reflection.Emit": ["AssemblyBuilder", "TypeBuilder", "MethodBuilder", "ILGenerator", "OpCodes"],
  "System.Collections.Concurrent": [
    "ConcurrentDictionary", "ConcurrentQueue", "ConcurrentStack", "ConcurrentBag",
    "BlockingCollection", "Partitioner", "OrderablePartitioner",
  ],
  "System.Collections.ObjectModel": [
    "ObservableCollection", "ReadOnlyCollection", "ReadOnlyDictionary", "KeyedCollection",
  ],
  "System.Collections": [
    "Hashtable", "ArrayList", "SortedList", "BitArray", "StructuralComparisons",
  ],
  "System.Collections.Immutable": [
    "ImmutableArray", "ImmutableList", "ImmutableDictionary", "ImmutableHashSet",
    "ImmutableQueue", "ImmutableStack", "ImmutableSortedSet",
  ],
  "System.Diagnostics": [
    "Stopwatch", "Process", "ProcessStartInfo", "Debug", "Trace", "Debugger",
    "ProcessWindowStyle", "Activity", "ActivitySource",
  ],
  "System.Diagnostics.CodeAnalysis": [
    "AllowNull", "NotNullWhen", "MaybeNullWhen", "NotNullIfNotNull", "MemberNotNull",
    "SetsRequiredMembers", "ConstantExpected", "Experimental",
  ],
  "System.Globalization": [
    "CultureInfo", "DateTimeFormatInfo", "NumberFormatInfo", "TextInfo", "Calendar",
    "CompareOptions", "DateTimeStyles", "NumberStyles", "GregorianCalendar", "UnicodeCategory",
  ],
  "System.Net": [
    "Dns", "IPAddress", "IPEndPoint", "IPHostEntry", "HttpStatusCode", "WebUtility",
    "CredentialCache", "NetworkCredential", "AuthenticationSchemes", "Cookie", "CookieContainer",
  ],
  "System.Net.Sockets": [
    "Socket", "TcpClient", "TcpListener", "UdpClient", "NetworkStream", "SocketException",
    "AddressFamily", "SocketType", "ProtocolType", "SocketAsyncEventArgs", "LingerOption",
    "UdpReceiveResult", "SocketError", "SocketFlags", "SelectMode", "UnixDomainSocketEndPoint",
  ],
  "System.Net.Security": ["SslStream", "SslClientAuthenticationOptions"],
  "System.Security.Cryptography": [
    "SHA256", "SHA384", "SHA512", "MD5", "SHA1", "Aes", "RSA", "DSA", "ECDsa",
    "HMACSHA256", "HMACSHA512", "RandomNumberGenerator", "HashAlgorithm",
    "CryptographicException", "AesGcm", "Rfc2898DeriveBytes", "CryptoStream", "AesCcm",
    "CryptoStreamMode", "CipherMode", "PaddingMode", "ECDiffieHellman",
  ],
  "System.Numerics": ["BigInteger", "Complex", "Vector2", "Vector3", "Vector4", "Matrix4x4", "BitOperations"],
  "System.Data": ["DataTable", "DataSet", "DataRow", "DataColumn", "DataView", "SqlDbType"],
  "System.Data.Common": ["DbConnection", "DbCommand", "DbDataReader", "DbProviderFactories"],
  "System.Xml.Linq": ["XDocument", "XElement", "XAttribute", "XName", "XNamespace"],
  "System.Xml": ["XmlDocument", "XmlNode", "XmlElement", "XmlWriter", "XmlReader", "XmlSerializer"],
  "System.Xml.Serialization": ["XmlSerializer", "XmlRoot", "XmlElement"],
  "System.ComponentModel": [
    "INotifyPropertyChanged", "PropertyChangedEventArgs", "Component", "IBindingList",
    "CancelEventArgs", "INotifyPropertyChanging", "TypeDescriptor",
  ],
  "System.ComponentModel.DataAnnotations": ["Required", "Range", "StringLength", "EmailAddress"],
  "System.Buffers": ["ArrayPool", "MemoryPool", "IBufferWriter", "MemoryHandle", "SearchValues"],
  "System.Linq.Expressions": [
    "Expression", "ParameterExpression", "LambdaExpression", "ExpressionType",
    "MemberExpression", "BinaryExpression", "ConstantExpression", "NewExpression",
  ],
  "System.IO.Compression": [
    "ZipFile", "ZipArchive", "ZipArchiveEntry", "GZipStream", "DeflateStream",
    "BrotliStream", "ZLibStream", "CompressionLevel",
  ],
  "System.Runtime.InteropServices": [
    "Marshal", "DllImportAttribute", "StructLayoutAttribute", "GCHandle",
    "LibraryImportAttribute", "MarshalAsAttribute", "UnmanagedCallersOnlyAttribute",
  ],
  "System.Runtime.Serialization": ["DataContractAttribute", "DataMemberAttribute", "ISerializable"],
  "System.Runtime.Serialization.Json": ["DataContractJsonSerializer"],
  "System.Runtime.Loader": ["AssemblyLoadContext", "AssemblyDependencyResolver"],
  "System.Runtime.CompilerServices": ["CallerMemberName", "CallerFilePath", "CallerLineNumber", "Unsafe"],
  "System.Threading": ["Interlocked", "Thread", "SemaphoreSlim", "Mutex", "CancellationToken"],
  "System.Collections.Generic": ["Comparer", "EqualityComparer", "HashSet", "SortedSet", "LinkedList"],
  "System.Formats.Tar": ["TarFile", "TarReader", "TarWriter", "TarEntry"],
  "System.Resources": ["ResourceManager"],
  "System.Net.Http.Headers": [
    "MediaTypeHeaderValue", "HttpRequestHeaders", "HttpResponseHeaders",
    "AuthenticationHeaderValue", "HttpContentHeaders", "RangeHeaderValue",
  ],
  "System.Runtime.ExceptionServices": ["ExceptionDispatchInfo"],
  "System.Media": ["SoundPlayer"],
};

const NAME_TO_NS = new Map();
for (const [ns, names] of Object.entries(NS_MAP)) {
  for (const name of names) {
    if (!NAME_TO_NS.has(name)) NAME_TO_NS.set(name, ns);
  }
}

const results = JSON.parse(readFileSync("scripts/csharp3-verify-results.json", "utf8"));
const needed = new Map(); // key -> Set<ns>
const unknown = new Map(); // key -> Set<name>

for (const f of results.buildFails) {
  const names = new Set();
  for (const d of f.detail) {
    let m = d.match(/^CS0246:.*name '([^']+)'/);
    if (m) names.add(m[1]);
    m = d.match(/^CS0103:.*name '([^']+)'/);
    if (m) names.add(m[1]);
    m = d.match(/^CS0234:.*name '([^']+)' does not exist in the namespace '([^']+)'/);
    if (m) names.add(m[1]);
  }
  for (const n of [...names]) {
    if (n.includes("<")) {
      names.delete(n);
      names.add(n.slice(0, n.indexOf("<")));
    }
  }
  for (const name of names) {
    const ns = NAME_TO_NS.get(name);
    if (ns) {
      if (!needed.has(f.key)) needed.set(f.key, new Set());
      needed.get(f.key).add(ns);
    } else {
      if (!unknown.has(f.key)) unknown.set(f.key, new Set());
      unknown.get(f.key).add(name);
    }
  }
}

console.log(`可自动补 using 的代码段：${needed.size} 段`);
console.log(`仍缺（需人工判断）的标识符：`);
const unknownNames = new Set([...unknown.values()].flatMap((s) => [...s]));
console.log([...unknownNames].join(", "));

if (process.argv.includes("--dry")) process.exit(0);

let total = 0;
for (let i = 1; i <= 15; i++) {
  const file = `app/courses-data/csharp3-chapters-batch${i}.js`;
  const changes = applyTransform(file, ({ key, code }) => {
    const nss = needed.get(key);
    if (!nss) return null;
    const add = [...nss].filter((ns) => !hasUsing(code, ns));
    if (!add.length) return null;
    return addUsings(code, add);
  });
  if (changes.length) {
    console.log(`${file}: ${changes.length} 段补 using`);
    total += changes.length;
  }
}
console.log(`合计 ${total} 段已写入`);
