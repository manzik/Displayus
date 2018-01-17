using System;
using System.Text;
using System.IO;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Forms;
using System.Net.Sockets;
using System.Diagnostics;
using System.ComponentModel;
using System.Text.RegularExpressions;
using System.Windows.Input;
using System.Runtime.InteropServices;
using System.Windows.Automation;
using System.Runtime.Serialization.Formatters.Binary;


using Microsoft;
using Microsoft.Win32;
using Microsoft.Win32.SafeHandles;

using EventHook;

using Gma.System.MouseKeyHook;
using Gma.System.MouseKeyHook.Implementation;

namespace Displayus
{
    public class WindowHandleInfo
    {
        private delegate bool EnumWindowProc(IntPtr hwnd, IntPtr lParam);

        [DllImport("user32")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool EnumChildWindows(IntPtr window, EnumWindowProc callback, IntPtr lParam);

        private IntPtr _MainHandle;

        public WindowHandleInfo(IntPtr handle)
        {
            this._MainHandle = handle;
        }

        public List<IntPtr> GetAllChildHandles()
        {
            List<IntPtr> childHandles = new List<IntPtr>();

            GCHandle gcChildhandlesList = GCHandle.Alloc(childHandles);
            IntPtr pointerChildHandlesList = GCHandle.ToIntPtr(gcChildhandlesList);

            try
            {
                EnumWindowProc childProc = new EnumWindowProc(EnumWindow);
                EnumChildWindows(this._MainHandle, childProc, pointerChildHandlesList);
            }
            finally
            {
                gcChildhandlesList.Free();
            }

            return childHandles;
        }

        private bool EnumWindow(IntPtr hWnd, IntPtr lParam)
        {
            GCHandle gcChildhandlesList = GCHandle.FromIntPtr(lParam);

            if (gcChildhandlesList == null || gcChildhandlesList.Target == null)
            {
                return false;
            }

            List<IntPtr> childHandles = gcChildhandlesList.Target as List<IntPtr>;
            childHandles.Add(hWnd);

            return true;
        }
    }

    //https://stackoverflow.com/a/2336322
    public static class ProcessExtensions
    {
        private static string FindIndexedProcessName(int pid)
        {
            var processName = Process.GetProcessById(pid).ProcessName;
            var processesByName = Process.GetProcessesByName(processName);
            string processIndexdName = null;

            for (var index = 0; index < processesByName.Length; index++)
            {
                processIndexdName = index == 0 ? processName : processName + "#" + index;
                var processId = new PerformanceCounter("Process", "ID Process", processIndexdName);
                if ((int)processId.NextValue() == pid)
                {
                    return processIndexdName;
                }
            }

            return processIndexdName;
        }

        private static Process FindPidFromIndexedProcessName(string indexedProcessName)
        {
            var parentId = new PerformanceCounter("Process", "Creating Process ID", indexedProcessName);
            return Process.GetProcessById((int)parentId.NextValue());
        }

        public static Process Parent(this Process process)
        {
            return FindPidFromIndexedProcessName(FindIndexedProcessName(process.Id));
        }
    }

    internal static class Win32
    {
        public const int WM_SYSCOMMAND = 0x0112;
        public const int SC_CLOSE = 0xF060;
        public const uint WM_KEYDOWN = 0x0100;

        public const int VK_F5 = 0x74;

        public const uint LVM_GETITEMCOUNT = 0x1000 + 4;
        public const uint LVM_SETITEMPOSITION = 0x1000 + 15;
        public const uint LVM_GETITEMPOSITION = 0x1000 + 16;
        public const uint LVM_GETITEMW = 0x1000 + 75;
        public const uint LVM_GETITEMRECT = 0x100E;
        public const uint WM_MEASUREITEM = 0x1000 + 44;
        public const uint LVM_GETVIEWRECT = 0x1000 + 34;
        public const uint LVM_GETORIGIN = 0x1000 + 41;
        public const uint LVIF_TEXT = 0x0001;

        [DllImport("user32.dll", SetLastError = true)]
        public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

        public enum DesktopWindow
        {
            ProgMan,
            SHELLDLL_DefViewParent,
            SHELLDLL_DefView,
            SysListView32
        }

        [DllImport("user32.dll")]
        public static extern IntPtr GetShellWindow();

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        public static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

        public static IntPtr GetDesktopWindow(DesktopWindow desktopWindow)
        {
            IntPtr _ProgMan = GetShellWindow();
            IntPtr _SHELLDLL_DefViewParent = _ProgMan;
            IntPtr _SHELLDLL_DefView = FindWindowEx(_ProgMan, IntPtr.Zero, "SHELLDLL_DefView", null);
            IntPtr _SysListView32 = FindWindowEx(_SHELLDLL_DefView, IntPtr.Zero, "SysListView32", "FolderView");

            if (_SHELLDLL_DefView == IntPtr.Zero)
            {
                EnumWindows((hwnd, lParam) =>
                {
                    var sb = new StringBuilder(256);
                    GetClassName(hwnd, sb, sb.Capacity);

                    if (sb.ToString() == "WorkerW")
                    {
                        IntPtr child = FindWindowEx(hwnd, IntPtr.Zero, "SHELLDLL_DefView", null);
                        if (child != IntPtr.Zero)
                        {
                            _SHELLDLL_DefViewParent = hwnd;
                            _SHELLDLL_DefView = child;
                            _SysListView32 = FindWindowEx(child, IntPtr.Zero, "SysListView32", "FolderView"); ;
                            return false;
                        }
                    }
                    return true;
                }, IntPtr.Zero);
            }

            switch (desktopWindow)
            {
                case DesktopWindow.ProgMan:
                    return _ProgMan;
                case DesktopWindow.SHELLDLL_DefViewParent:
                    return _SHELLDLL_DefViewParent;
                case DesktopWindow.SHELLDLL_DefView:
                    return _SHELLDLL_DefView;
                case DesktopWindow.SysListView32:
                    return _SysListView32;
                default:
                    return IntPtr.Zero;
            }
        }

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern IntPtr SendMessage(IntPtr hWnd, UInt32 Msg, IntPtr wParam, IntPtr lParam);

        public static IntPtr MakeLParam(int wLow, int wHigh)
        {
            return (IntPtr)(((short)wHigh << 16) | (wLow & 0xffff));
        }

        [DllImport("user32.dll")]
        public static extern IntPtr SendMessage(IntPtr hWnd, UInt32 msg, int wParam, IntPtr lParam);

        [DllImport("user32.dll", SetLastError = true)]
        public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        [DllImport("kernel32.dll")]
        public static extern IntPtr OpenProcess(ProcessAccess dwDesiredAccess, [MarshalAs(UnmanagedType.Bool)] bool bInheritHandle, uint dwProcessId);

        [Flags]
        public enum ProcessAccess
        {
            /// <summary>
            /// Required to create a thread.
            /// </summary>
            CreateThread = 0x0002,

            /// <summary>
            ///
            /// </summary>
            SetSessionId = 0x0004,

            /// <summary>
            /// Required to perform an operation on the address space of a process
            /// </summary>
            VmOperation = 0x0008,

            /// <summary>
            /// Required to read memory in a process using ReadProcessMemory.
            /// </summary>
            VmRead = 0x0010,

            /// <summary>
            /// Required to write to memory in a process using WriteProcessMemory.
            /// </summary>
            VmWrite = 0x0020,

            /// <summary>
            /// Required to duplicate a handle using DuplicateHandle.
            /// </summary>
            DupHandle = 0x0040,

            /// <summary>
            /// Required to create a process.
            /// </summary>
            CreateProcess = 0x0080,

            /// <summary>
            /// Required to set memory limits using SetProcessWorkingSetSize.
            /// </summary>
            SetQuota = 0x0100,

            /// <summary>
            /// Required to set certain information about a process, such as its priority class (see SetPriorityClass).
            /// </summary>
            SetInformation = 0x0200,

            /// <summary>
            /// Required to retrieve certain information about a process, such as its token, exit code, and priority class (see OpenProcessToken).
            /// </summary>
            QueryInformation = 0x0400,

            /// <summary>
            /// Required to suspend or resume a process.
            /// </summary>
            SuspendResume = 0x0800,

            /// <summary>
            /// Required to retrieve certain information about a process (see GetExitCodeProcess, GetPriorityClass, IsProcessInJob, QueryFullProcessImageName).
            /// A handle that has the PROCESS_QUERY_INFORMATION access right is automatically granted PROCESS_QUERY_LIMITED_INFORMATION.
            /// </summary>
            QueryLimitedInformation = 0x1000,

            /// <summary>
            /// Required to wait for the process to terminate using the wait functions.
            /// </summary>
            Synchronize = 0x100000,

            /// <summary>
            /// Required to delete the object.
            /// </summary>
            Delete = 0x00010000,

            /// <summary>
            /// Required to read information in the security descriptor for the object, not including the information in the SACL.
            /// To read or write the SACL, you must request the ACCESS_SYSTEM_SECURITY access right. For more information, see SACL Access Right.
            /// </summary>
            ReadControl = 0x00020000,

            /// <summary>
            /// Required to modify the DACL in the security descriptor for the object.
            /// </summary>
            WriteDac = 0x00040000,

            /// <summary>
            /// Required to change the owner in the security descriptor for the object.
            /// </summary>
            WriteOwner = 0x00080000,

            StandardRightsRequired = 0x000F0000,

            /// <summary>
            /// All possible access rights for a process object.
            /// </summary>
            AllAccess = StandardRightsRequired | Synchronize | 0xFFFF
        }

        [DllImport("kernel32.dll", SetLastError = true, ExactSpelling = true)]
        public static extern IntPtr VirtualAllocEx(IntPtr hProcess, IntPtr lpAddress,
           uint dwSize, AllocationType flAllocationType, MemoryProtection flProtect);

        [Flags]
        public enum AllocationType
        {
            Commit = 0x1000,
            Reserve = 0x2000,
            Decommit = 0x4000,
            Release = 0x8000,
            Reset = 0x80000,
            Physical = 0x400000,
            TopDown = 0x100000,
            WriteWatch = 0x200000,
            LargePages = 0x20000000
        }

        [Flags]
        public enum MemoryProtection
        {
            Execute = 0x10,
            ExecuteRead = 0x20,
            ExecuteReadWrite = 0x40,
            ExecuteWriteCopy = 0x80,
            NoAccess = 0x01,
            ReadOnly = 0x02,
            ReadWrite = 0x04,
            WriteCopy = 0x08,
            GuardModifierflag = 0x100,
            NoCacheModifierflag = 0x200,
            WriteCombineModifierflag = 0x400
        }

        [DllImport("kernel32.dll", SetLastError = true, ExactSpelling = true)]
        public static extern bool VirtualFreeEx(IntPtr hProcess, IntPtr lpAddress,
           int dwSize, FreeType dwFreeType);

        [Flags]
        public enum FreeType
        {
            Decommit = 0x4000,
            Release = 0x8000,
        }

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool CloseHandle(IntPtr hHandle);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern bool WriteProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, IntPtr lpBuffer, int nSize, ref uint lpNumberOfBytesWritten);

        [DllImport("kernel32.dll", SetLastError = true)]
        public static extern Int32 ReadProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, [Out] IntPtr buffer, int size, ref uint lpNumberOfBytesRead);

        [DllImport("Shell32.dll")]
        public static extern int SHChangeNotify(int eventId, int flags, IntPtr item1, IntPtr item2);

        [DllImport("user32.dll")]
        public static extern bool PostMessage(IntPtr hWnd, UInt32 Msg, int wParam, int lParam);
    }

    public struct DesktopPoint
    {
        public int X;
        public int Y;

        public DesktopPoint(int x, int y)
        {
            this.X = x;
            this.Y = y;
        }
    }

    public struct ItemRect
    {
        public int left;
        public int top;
        public int right;
        public int bottom;
    }

    public struct DesktopMeasure
    {
        public int itemWidth;
        public int itemHeight;
        public DesktopMeasure(int itemWidth, int itemHeight)
        {
            this.itemWidth = itemWidth;
            this.itemHeight = itemHeight;
        }
    }

    public struct NamedDesktopIcon
    {
        public string Name;
        public int X;
        public int Y;
        public int itemWidth;
        public int itemHeight;
        public NamedDesktopIcon(string name, int x, int y, int width, int height)
        {
            this.Name = name;
            this.X = x;
            this.Y = y;
            this.itemWidth = width;
            this.itemHeight = height;
        }
    }

    internal class Desktop
    {
        private IntPtr _desktopHandle;
        private List<string> _currentIconsOrder;
        public int IconSize = 32;


        public Desktop()
        {
            _desktopHandle = Win32.GetDesktopWindow(Win32.DesktopWindow.SysListView32);

            AutomationElement el = AutomationElement.FromHandle(_desktopHandle);

            TreeWalker walker = TreeWalker.ContentViewWalker;
            _currentIconsOrder = new List<string>();
            for (AutomationElement child = walker.GetFirstChild(el);
                child != null;
                child = walker.GetNextSibling(child))
            {
                _currentIconsOrder.Add(child.Current.Name);
            }
        }

        private int GetIconsNumber()
        {
            return (int)Win32.SendMessage(_desktopHandle, Win32.LVM_GETITEMCOUNT, IntPtr.Zero, IntPtr.Zero);
        }

        public NamedDesktopIcon[] GetIconsPositions()
        {
            uint desktopProcessId;
            Win32.GetWindowThreadProcessId(_desktopHandle, out desktopProcessId);

            IntPtr desktopProcessHandle = IntPtr.Zero;
            try
            {
                desktopProcessHandle = Win32.OpenProcess(Win32.ProcessAccess.VmOperation | Win32.ProcessAccess.VmRead |
                    Win32.ProcessAccess.VmWrite, false, desktopProcessId);

                return GetIconsPositions(desktopProcessHandle);
            }
            finally
            {
                if (desktopProcessHandle != IntPtr.Zero)
                { Win32.CloseHandle(desktopProcessHandle); }
            }
        }

        private NamedDesktopIcon[] GetIconsPositions(IntPtr desktopProcessHandle)
        {
            IntPtr sharedMemoryPointer = IntPtr.Zero;

            try
            {
                sharedMemoryPointer = Win32.VirtualAllocEx(desktopProcessHandle, IntPtr.Zero, 4096, Win32.AllocationType.Reserve | Win32.AllocationType.Commit, Win32.MemoryProtection.ReadWrite);

                return GetIconsPositions(desktopProcessHandle, sharedMemoryPointer);
            }
            finally
            {
                if (sharedMemoryPointer != IntPtr.Zero)
                {
                    Win32.VirtualFreeEx(desktopProcessHandle, sharedMemoryPointer, 0, Win32.FreeType.Release);
                }
            }

        }


        private NamedDesktopIcon[] GetIconsPositions(IntPtr desktopProcessHandle, IntPtr sharedMemoryPointer)
        {
            var listOfPoints = new LinkedList<NamedDesktopIcon>();

            var numberOfIcons = GetIconsNumber();
            if (_currentIconsOrder.Count() != numberOfIcons)
            {
                AutomationElement el = AutomationElement.FromHandle(_desktopHandle);

                TreeWalker walker = TreeWalker.ContentViewWalker;
                _currentIconsOrder = new List<string>();
                for (AutomationElement child = walker.GetFirstChild(el);
                    child != null;
                    child = walker.GetNextSibling(child))
                {
                    _currentIconsOrder.Add(child.Current.Name);
                }
            }
            for (int itemIndex = 0; itemIndex < numberOfIcons; itemIndex++)
            {

                uint numberOfBytes2 = 0;
                ItemRect[] measures = new ItemRect[1];

                Win32.WriteProcessMemory(desktopProcessHandle, sharedMemoryPointer,
                    Marshal.UnsafeAddrOfPinnedArrayElement(measures, 0),
                    Marshal.SizeOf(typeof(ItemRect)),
                    ref numberOfBytes2);

                Win32.SendMessage(_desktopHandle, Win32.LVM_GETITEMRECT, itemIndex, sharedMemoryPointer);

                Win32.ReadProcessMemory(desktopProcessHandle, sharedMemoryPointer,
                    Marshal.UnsafeAddrOfPinnedArrayElement(measures, 0),
                    Marshal.SizeOf(typeof(ItemRect)),
                    ref numberOfBytes2);
                ItemRect measure = new ItemRect();

                measure = measures[0];
                listOfPoints.AddLast(new NamedDesktopIcon(_currentIconsOrder[itemIndex], measure.left, measure.top, measure.right - measure.left, measure.bottom - measure.top));
            }
            return listOfPoints.ToArray();
        }

        public void SetIconPositions(IEnumerable<NamedDesktopIcon> iconPositions)
        {
            foreach (var position in iconPositions)
            {
                var iconIndex = _currentIconsOrder.IndexOf(position.Name);
                if (iconIndex == -1)
                { continue; }

                Win32.SendMessage(_desktopHandle, Win32.LVM_SETITEMPOSITION, iconIndex, Win32.MakeLParam(position.X, position.Y));
            }
        }

        public void Refresh()
        {
            Win32.PostMessage(_desktopHandle, Win32.WM_KEYDOWN, Win32.VK_F5, 0);

            Win32.SHChangeNotify(0x8000000, 0x1000, IntPtr.Zero, IntPtr.Zero);
        }
    }



    class Program
    {
        public static Desktop desk = new Desktop();
        private static StreamWriter stdout = new StreamWriter(Console.OpenStandardOutput(), System.Text.Encoding.UTF8, 1048576);
        private static IKeyboardMouseEvents m_GlobalHook;
        public static Point lastmousepos;
        public static IntPtr lastcurrentwindow;
        public static string socketsend = "none";
        public static IntPtr wallpaperhandle;
        public static IntPtr workerw;
        private static System.Net.Sockets.TcpClient clientSocket = new System.Net.Sockets.TcpClient();
        private static void startsock(int port)
        {
            clientSocket.Connect("127.0.0.1", port);
        }
        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

        [DllImport("user32.dll", SetLastError = false)]
        public static extern IntPtr GetDesktopWindow();

        [DllImport("user32.dll")]
        static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

        [DllImport("user32.dll")]
        static extern IntPtr WindowFromPoint(System.Drawing.Point p);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        internal static extern bool GetCursorPos(ref Win32Point pt);
        [StructLayout(LayoutKind.Sequential)]
        internal struct Win32Point
        {
            public Int32 X;
            public Int32 Y;
        };
        public static Point GetMousePosition()
        {
            Win32Point w32Mouse = new Win32Point();
            GetCursorPos(ref w32Mouse);
            return new Point(w32Mouse.X, w32Mouse.Y);
        }
        private static string getclass(IntPtr handle)
        {
            const int maxChars = 2048;
            StringBuilder className = new StringBuilder(maxChars);
            if (GetClassName(handle, className, maxChars) > 0)
            {
                string classname = className.ToString();
                return classname;
            }
            return "";
        }
        public static List<string> settobackonload = new List<string>();
        private static void senddata()
        {
            if (socketsend != "none")
            {
                socketsend = socketsend.Remove(socketsend.Length - 1);
                socketsend = socketsend.Remove(0, 4);
            }
            writelinefast(socketsend);
            socketsend = "none";
        }

        [System.Runtime.InteropServices.DllImport("user32.dll")]
        public static extern long SendMessageTimeout(int hWnd, int Msg, int wParam, string lParam, int fuFlags, int uTimeout, out int lpdwResult);
        //constants needed
        private const int HWND_BROADCAST = 0xffff;
        private const int WM_SETTINGCHANGE = 0x001A;
        private const int SPI_SETNONCLIENTMETRICS = 0x0002;
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern IntPtr FindWindow(
    [MarshalAs(UnmanagedType.LPTStr)] string lpClassName,
    [MarshalAs(UnmanagedType.LPTStr)] string lpWindowName);
        [DllImport("user32.dll")]
        public static extern IntPtr SetParent(
            IntPtr hWndChild,      // handle to window
            IntPtr hWndNewParent   // new parent window
            );
        [DllImport("User32")]
        private static extern int ShowWindow(int hwnd, int nCmdShow);
        static Version ver = Environment.OSVersion.Version;
        static bool iswindows7 = ver.Major == 6 && ver.Minor == 1;
        [DllImport("user32")]
        private static extern bool SetForegroundWindow(IntPtr hwnd);
        static IntPtr overlaywindow = IntPtr.Zero;
        static IntPtr mainwindow = IntPtr.Zero;
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool IsWindow(IntPtr hWnd);

        private static void checksock(string input)
        {

            socketsend += "log=settobasebackreq|";
            senddata();

            string returndata = input;

            string[] reqs;
            if (returndata == " ")
            {
                reqs = new string[] { };
            }
            else
            {
                reqs = returndata.Split(new string[] { "|" }, StringSplitOptions.None);
            }
            bool reqbacknow = false;
            List<string> reqopts = new List<string>();
            for (int i = 0; i < reqs.Length; i++)
            {
                string[] reqdata = reqs[i].Split(new string[] { "=" }, StringSplitOptions.None);
                if (reqdata.Length == 2)
                {
                    //reqdata[1] = Regex.Replace(reqdata[1], @"[^A-Za-z0-9]+", "");
                }
                if (reqdata[0] == "reqopts")
                {
                    reqopts.Add(reqdata[1]);
                }
                else
                if (reqdata[0] == "anotherappinfullscreen")
                {
                    socketsend += ("anotherwindowfullscreen=" + isanotherappinfullscreen().ToString());
                    senddata();
                }

                else
                if (reqdata[0] == "setasoverlaybyhandlehex")
                {
                    overlaywindow = new IntPtr(Convert.ToInt32(reqdata[1], 16));
                    if (mainwindow != IntPtr.Zero)
                    {
                        W32.SetParent(overlaywindow, mainwindow);
                    }
                }
                else
                if (reqdata[0].Substring(0, 26) == "setasbackgroundbyhandlehex")
                {

                    wallpaperhandle = new IntPtr(Convert.ToInt32(reqdata[1], 16));
                    if (!IsWindow(wallpaperhandle))
                        continue;
                    if (iswindows7)
                    {
                        IntPtr hwndParent = FindWindow("Progman", null);
                        SetParent(wallpaperhandle, hwndParent);
                        SetWindowPos(wallpaperhandle, new IntPtr(-1), 0, 0, 0, 0, 0x1 | 0x2);
                        SetForegroundWindow(wallpaperhandle);
                    }
                    else
                    {
                        W32.SetParent(wallpaperhandle, workerw);
                    }
                    /*
                    if (reqdata[0].Substring(26, 7) == "asoverlay")
                    {
                        SetParent(wallpaperhandle, basebackground);
                        overlayitems.Add(wallpaperhandle);
                    }
                    else
                        if (basebackground == IntPtr.Zero)
                    {
                        basebackground = wallpaperhandle;
                        socketsend += "log=settobaseback|";
                        senddata();
                    }
                    */
                    if (overlaywindow != IntPtr.Zero)
                    {
                        W32.SetParent(overlaywindow, wallpaperhandle);
                        SetWindowPos(overlaywindow, new IntPtr(-1), 0, 0, 0, 0, 0x1 | 0x2);
                        SetForegroundWindow(overlaywindow);
                        
                    }
                    mainwindow = wallpaperhandle;
                    socketsend += "log=" + wallpaperhandle.ToString() + "|";
                    socketsend += "senttobackground={\"handle\":" + reqdata[1] + "}|";
                    senddata();
                }
                else
                if (reqdata[0] == "setasbackground")
                {
                    bool done = false;
                    while (!done)
                    {
                        IntPtr hWnd = IntPtr.Zero;

                        foreach (Process pList in Process.GetProcesses())
                        {
                            if (pList.MainWindowTitle.Contains(reqdata[1]))
                            {
                                wallpaperhandle = pList.MainWindowHandle;
                                done = true;
                            }
                        }

                        if (done)
                        {
                            Console.WriteLine("log=" + wallpaperhandle.ToString() + "|");
                            return;
                            if (iswindows7)
                            {
                                IntPtr hwndParent = FindWindow("Progman", null);
                                SetParent(wallpaperhandle, hwndParent);
                                SetWindowPos(wallpaperhandle, new IntPtr(-1), 0, 0, 0, 0, 0x1 | 0x2);
                                SetForegroundWindow(wallpaperhandle);
                            }
                            else
                                W32.SetParent(wallpaperhandle, workerw);
                        }
                    }
                }
                else

                    if (reqdata[0] == "removefrombackgroundbyhandlehex")
                {
                    /*
                    socketsend += "log=removebaseback|";
                    senddata();

                    if (new IntPtr(Convert.ToInt32(reqdata[1], 16)) == basebackground)
                    {
                        basebackground = IntPtr.Zero;
                        socketsend += "log=removedbaseback|";
                        senddata();
                    }
                    */
                    var removingwallpaperhandle = new IntPtr(Convert.ToInt32(reqdata[1], 16));
                    if (!IsWindow(removingwallpaperhandle))
                        continue;
                    W32.SetParent(removingwallpaperhandle, IntPtr.Zero);
                    if (overlaywindow != IntPtr.Zero && mainwindow == removingwallpaperhandle)
                    {
                        W32.SetParent(overlaywindow, workerw);
                    }
                    mainwindow = IntPtr.Zero;
                }
                else
                    if (reqdata[0] == "removefrombackground")
                {
                    W32.SetParent(wallpaperhandle, IntPtr.Zero);
                }
                else

                        if (reqdata[0] == "reqbacknow")
                {
                    if (reqdata[1] == "true")
                    {

                        reqbacknow = true;
                    }
                }
                else
                        if (reqdata[0] == "setasbackgroundonload")
                {
                    settobackonload.Add(reqdata[1]);
                }
                else
                        if (reqdata[0] == "getdesktopicons")
                {

                    string str_icons = "";
                    var arr_icons = icons_prev;
                    for (int ind = 0; ind < arr_icons.Length; ind++)
                    {
                        str_icons += "{\"x\":" + arr_icons[ind].X + ",\"y\":" + arr_icons[ind].Y + ",\"height\":" + arr_icons[ind].itemHeight + ",\"width\":" + arr_icons[ind].itemWidth + ",\"name\":\"" + arr_icons[ind].Name.Replace("\n", "").Replace("\r", "").Replace("\\n", "").Replace("\\r", "").Replace("\r\n", "").Replace("\\r\\n", "").Replace("|", "") + "\"},";
                    }
                    str_icons = str_icons.Substring(0, str_icons.Length - 1);
                    socketsend += "getdesktopicons={\"icons\":[" + str_icons + "]}|";
                    senddata();
                }


            }
            if (reqbacknow)
            {
                checksock(" ");
            }
        }
        public static void apprun()
        {
            KeyboardWatcher.Start();
            KeyboardWatcher.OnKeyInput += (s, e) =>
            {
                socketsend += "keyevent={\"keycode\":" + 0 + ",\"event\":\"" + e.KeyData.EventType + "\",\"key\": \"" + e.KeyData.Keyname + "\" }|";
                senddata();
            };
            m_GlobalHook = Hook.GlobalEvents();
            m_GlobalHook.MouseDownExt += GlobalHookMouseDownExt;
            m_GlobalHook.MouseUpExt += GlobalHookMouseUpExt;
            m_GlobalHook.MouseMoveExt += GlobalHookMouseMoveExt;
        }
        private static void GlobalHookMouseMoveExt(object sender, MouseEventExtArgs e)
        {
            Point mouse = new Point(e.X, e.Y);
            if (lastmousepos.X != mouse.X || lastmousepos.Y != mouse.Y)
            {
                socketsend += "mousepos={\"x\":" + (mouse.X).ToString() + ",\"y\": " + (mouse.Y).ToString() + "}|";
                lastmousepos.X = mouse.X; lastmousepos.Y = mouse.Y;
                IntPtr currentwindow = WindowFromPoint(mouse);

                if (currentwindow != IntPtr.Zero && lastcurrentwindow != currentwindow)
                {

                    const int nChars = 2048;
                    StringBuilder Buff = new StringBuilder(nChars);
                    GetWindowText(currentwindow, Buff, nChars);
                    socketsend += "currentpointing=" + ("{\"title\":\"" + Buff.ToString() + "\",\"class\":\"" + getclass(currentwindow) + "\"}").Replace("\\", "\\\\").Replace("|", "") + "|";
                    lastcurrentwindow = currentwindow;
                }
                int isonicontmp = isonicon();
                if (lastonicon != isonicontmp)
                {
                    lastonicon = isonicontmp;
                    socketsend += "ondesktopiconcursor={\"ind\":" + lastonicon.ToString() + "}|";
                }
                senddata();
            }
        }

        private static void GlobalHookMouseDownExt(object sender, MouseEventExtArgs e)
        {
            socketsend += "mouseevent={\"button\":" + (e.Button.ToString() == "Left" ? "0" : e.Button.ToString() == "Right" ? "3" : e.Button.ToString() == "Middle" ? "2" : "0") + ",\"event\": \"" + "down" + "\" }|";
            senddata();
        }
        private static void GlobalHookMouseUpExt(object sender, MouseEventExtArgs e)
        {
            socketsend += "mouseevent={\"button\":" + (e.Button.ToString() == "Left" ? "0" : e.Button.ToString() == "Right" ? "3" : e.Button.ToString() == "Middle" ? "2" : "0") + ",\"event\": \"" + "up" + "\" }|";
            senddata();
        }
        [DllImport("kernel32.dll")]
        static extern void OutputDebugString(string lpOutputString);
        static void writelinefast(string str)
        {
            Task.Run(() => { stdout.WriteLine(new StringBuilder(str)); stdout.FlushAsync(); });

        }
        private static void TimerCallback(Object o)
        {
            checksock(" ");
            // Force a garbage collection to occur for this demo.
            GC.Collect();
        }
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
        static void OnProcessExit(object sender, EventArgs e)
        {
            Win32.SendMessage(workerw, Win32.WM_SYSCOMMAND,
        Win32.SC_CLOSE, (IntPtr)0);
        }
        [DllImport("user32.dll")]
        public static extern int SendMessage(
        int hWnd, // handle to destination window 
        uint Msg, // message 
        int wParam, // first message parameter 
        int lParam // second message parameter 
    );

        static bool isanotherappinfullscreen()
        {
            var w1 = WindowFromPoint(new System.Drawing.Point(0, 0));
            var w2 = WindowFromPoint(new System.Drawing.Point(SystemInformation.VirtualScreen.Width - 1, SystemInformation.VirtualScreen.Height - 1));
            return w1 == w2;
        }
        static WinEventDelegate dele = null;
        delegate void WinEventDelegate(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime);

        [DllImport("user32.dll")]
        static extern IntPtr SetWinEventHook(uint eventMin, uint eventMax, IntPtr hmodWinEventProc, WinEventDelegate lpfnWinEventProc, uint idProcess, uint idThread, uint dwFlags);

        private const uint WINEVENT_OUTOFCONTEXT = 0;
        private const uint EVENT_SYSTEM_FOREGROUND = 3;
        private static bool anotherfullscreen = false;
        private static bool shouldcheckfullscreen = false;
        static public void WinEventProc(IntPtr hWinEventHook, uint eventType, IntPtr hwnd, int idObject, int idChild, uint dwEventThread, uint dwmsEventTime)
        {
            shouldcheckfullscreen = true;

        }
        static public void anotherfullscreenchange()
        {
            socketsend += "anotherwindowfullscreen=" + anotherfullscreen + "|anotherwindowfullscreenchanged=true|";
            senddata();
        }
        static void Main(string[] args)
        {
            var parentname = Process.GetCurrentProcess().Parent().ProcessName;
            if (parentname != "electron" && parentname != "Displayus")
                return;
            dele = new WinEventDelegate(WinEventProc);
            IntPtr m_hhook = SetWinEventHook(0, 10, IntPtr.Zero, dele, 0, 0, WINEVENT_OUTOFCONTEXT);

            AppDomain.CurrentDomain.ProcessExit += new EventHandler(OnProcessExit);
            Console.OutputEncoding = Encoding.UTF8;

            // Fetch the Progman window
            IntPtr progman = W32.FindWindow("Progman", null);

            IntPtr result = IntPtr.Zero;

            // Send 0x052C to Progman. This message directs Progman to spawn a 
            // WorkerW behind the desktop icons. If it is already there, nothing 
            // happens.
            W32.SendMessageTimeout(progman,
                                   0x052C,
                                   new IntPtr(0),
                                   IntPtr.Zero,
                                   W32.SendMessageTimeoutFlags.SMTO_NORMAL,
                                   1000,
                                   out result);

            workerw = IntPtr.Zero;

            // We enumerate all Windows, until we find one, that has the SHELLDLL_DefView 
            // as a child. 
            // If we found that window, we take its next sibling and assign it to workerw.
            W32.EnumWindows(new W32.EnumWindowsProc((tophandle, topparamhandle) =>
            {
                IntPtr p = W32.FindWindowEx(tophandle,
                                            IntPtr.Zero,
                                            "SHELLDLL_DefView",
                                            IntPtr.Zero);

                if (p != IntPtr.Zero)
                {
                    // Gets the WorkerW Window after the current one.
                    workerw = W32.FindWindowEx(IntPtr.Zero,
                                               tophandle,
                                               "WorkerW",
                                               IntPtr.Zero);
                }

                return true;
            }), IntPtr.Zero);

            //windows 7
            if (iswindows7)
            {
                ShowWindow(workerw.ToInt32(), 0);
            }

            checksock(" ");
            apprun();
            Task.Run(() =>
                  {
                      while (true)
                      {
                          string read = Console.ReadLine();
                          checksock(read);
                      }

                  });
            System.Windows.Forms.Timer timer = new System.Windows.Forms.Timer();
            timer.Interval = 100;

            timer.Tick += new EventHandler((sender, eventArgs) =>
            {
                var isfull = isanotherappinfullscreen();
                if (isfull != anotherfullscreen)
                {
                    anotherfullscreen = isfull;
                    anotherfullscreenchange();
                }
                shouldcheckfullscreen = false;

                if (iswindows7)
                {

                    W32.EnumWindows(new W32.EnumWindowsProc((tophandle, topparamhandle) =>
                    {

                        IntPtr p = W32.FindWindowEx(tophandle,
                                                    IntPtr.Zero,
                                                    "SHELLDLL_DefView",
                                                    IntPtr.Zero);

                        if (p != IntPtr.Zero)
                        {
                            workerw = W32.FindWindowEx(IntPtr.Zero,
                                                       tophandle,
                                                       "WorkerW",
                                                       IntPtr.Zero);
                        }

                        return true;
                    }), IntPtr.Zero);
                    ShowWindow(workerw.ToInt32(), 0);
                }
                var newicons = desk.GetIconsPositions();
                if (icons_prev.Intersect(newicons).Count() != icons_prev.Union(newicons).Count())
                {
                    icons_prev = newicons;
                    DesktopIconsChange();
                }
            });
            timer.Start();

            socketsend += ("ready=true|");
            senddata();
            lastonicon = isonicon();
            icons_prev = desk.GetIconsPositions();
            DesktopIconsChange();
            Application.Run();
        }
        public static int lastonicon = -1;
        public static int isonicon()
        {
            try
            {
                for (int i = 0; i < icons_prev.Length; i++)
                {
                    var icon = icons_prev[i];
                    if (lastmousepos.X > icon.X && lastmousepos.X < icon.X + icon.itemWidth && lastmousepos.Y > icon.Y && lastmousepos.Y < icon.Y + icon.itemHeight)
                    {
                        return i;
                    }
                }
            }
            catch
            {
                return -1;
            }
            return -1;
        }
        public static void DesktopIconsChange()
        {

            string str_icons = "";
            var arr_icons = icons_prev;
            for (int ind = 0; ind < arr_icons.Length; ind++)
            {
                str_icons += "{\"x\":" + arr_icons[ind].X + ",\"y\":" + arr_icons[ind].Y + ",\"height\":" + arr_icons[ind].itemHeight + ",\"width\":" + arr_icons[ind].itemWidth + ",\"name\":\"" + arr_icons[ind].Name.Replace("\n", "").Replace("\r", "").Replace("\\n", "").Replace("\\r", "").Replace("\r\n", "").Replace("\\r\\n", "").Replace("|", "") + "\"},";
            }
            if (str_icons.Length > 0)
                str_icons = str_icons.Substring(0, str_icons.Length - 1);

            socketsend += "getdesktopicons={\"icons\":[" + str_icons + "]}|desktopiconschanged=true|";
            int isonicontmp = isonicon();
            if (lastonicon != isonicontmp)
            {
                lastonicon = isonicontmp;
                socketsend += "ondesktopiconcursor={\"ind\":" + lastonicon.ToString() + "}|";
            }
            senddata();
        }
        public static NamedDesktopIcon[] icons_prev;
        static void onwindowevent(object sender, string data)
        {
            writelinefast("newwindow=" + data);
            foreach (string item in settobackonload)
            {
                if (item.Contains(data))
                {
                    IntPtr hWnd = IntPtr.Zero;
                    foreach (Process pList in Process.GetProcesses())
                    {
                        if (pList.MainWindowTitle.Contains(data))
                        {

                            wallpaperhandle = pList.MainWindowHandle;
                        }
                    }
                    W32.SetParent(wallpaperhandle, workerw);
                    settobackonload.Remove(item);
                    break;
                }
            }
        }
    }
}