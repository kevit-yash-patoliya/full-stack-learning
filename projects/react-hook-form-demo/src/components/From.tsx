import { useForm } from "react-hook-form";

export default function Form(){

    const {register, handleSubmit, reset, formState:{errors}} = useForm({});
    
    return (<>

    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-900">

        <form onSubmit={handleSubmit((data)=> console.log(data))} className="
        flex flex-col gap-5 items-center p-10 bg-slate-500 h-[300px] w-[500px] rounded-md">
            <input type="text" {...register("name")} placeholder="Name" className="border rounded-lg px-2 py-1"/>
            {errors.name && <p>{errors.name?.message as string}</p>}
            <input type="email" {...register("email")} placeholder="Email" className="border rounded-lg px-2 py-1"/>
            {errors.email && <p>{errors.email?.message as string}</p>}
            <input type="password" {...register("password")} placeholder="Password" className="border rounded-lg px-2 py-1"/>
            {errors.password && <p>{errors.password?.message as string}</p>}
            
            <div className="flex gap-2 items-end h-[100px]">

            <button type="submit" className="border-red-200 border rounded-md px-2 py-1 ">Submit</button>
            <button type="button" onClick={() => reset()} className=" border rounded-md px-2 py-1">Reset</button>
            </div>
        </form>
            </div>
    </>)
}