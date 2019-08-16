import CMS from "netlify-cms-app"
import FileSystemBackendClass from "netlify-cms-backend-fs"
import { MdxControl, MdxPreview } from "netlify-cms-widget-mdx"

CMS.registerBackend("file-system", FileSystemBackendClass)
CMS.registerWidget("mdx", MdxControl, MdxPreview)
